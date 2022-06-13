import { NextFunction, Request, Response } from "express";
import { Between, getConnection, LessThan, MoreThan } from "typeorm";
import crypto from "crypto";
import moment from "moment";
import payComTransactionService from "@services/paymeTransaction.service";
import { ITransaction } from "@interfaces/transaction.interface";
import usersService from "@services/users.service";
import { PayMeException } from "@exceptions/PayMeException";

const STATE_CREATED = 1;
const STATE_COMPLETED = 2;
const STATE_CANCELLED = -1;
const STATE_CANCELLED_AFTER_COMPLETE = -2;

class PayComTransactionController {
  public usersService = new usersService();
  public transactionService = new payComTransactionService();

  public index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body) {
        throw new PayMeException(-32300, "Empty request");
        return;
      }
      if (!this.isLoggedIn(req.headers)) {
        throw new PayMeException(-32504, "Incorrect login");
        return;
      }

      await this.checkMethod(req, res, next);
    } catch (e) {
      if (e.code) {
        this.sendError(e.message, e.code, res, req);
      }
      next(e);
    }
  }
  ;

  private isLoggedIn(headers) {
    const authorization = headers["authorization"];
    if (!authorization) {
      return false;
    }
    const token = authorization.replace("Basic ", "");

    if (sha1(base64Decode(token)) !== sha1(`Paycom:${process.env.PAYCOM_KEY}`)) {
      return false;
    }

    return true;
  }

  private async checkMethod(req: Request, res: Response, next: NextFunction) {

    switch (req.body.method) {
      case "CheckPerformTransaction":
        await this.checkPerformTransaction(req, res, next);
        break;
      case "CreateTransaction":
        await this.createTransaction(req, res, next);
        break;
      case "PerformTransaction":
        await this.performTransaction(req, res, next);
        break;
      case "CancelTransaction":
        await this.cancelTransaction(req, res, next);
        break;
      case "CheckTransaction":
        await this.checkTransaction(req, res, next);
        break;
      case "GetStatement":
        await this.getStatement(req, res, next);
        break;

      default:
        throw new PayMeException(500, "Method not found");
    }
  }

  private checkPerformTransaction = async (req: Request, res: Response, next: NextFunction) => {
    await this.getAccount(Number(req.body.params.account.account));

    this.checkIsValidAmount(req.body.params.amount);

    return res.status(200).json(this.makeResponse(req, { allow: true }));
  };

  private async createTransaction(req: Request, res: Response, next: NextFunction) {
    const host = await this.getAccount(Number(req.body.params?.account?.account || 0));
    this.checkIsValidAmount(req.body.params.amount);

    try {
      const { id, time, amount } = req.body.params;
      const transaction = await this.transactionService.getOrCreate({
        user: host,
        create_time: Number(time),
        paycom_transaction_id: id,
        state: STATE_CREATED,
        amount: amount
      });
      return res.status(200).json(this.makeResponse(req, {
        create_time: Number(transaction.create_time),
        transaction: String(transaction.id),
        state: STATE_CREATED
      }));
    } catch (e) {
      throw new PayMeException(-31008, "Server error");
    }
  }

  private async performTransaction(req: Request, res: Response, next: NextFunction) {
    let transaction = await this.transactionService.getByPayComTransactionId(req.body.params.id);
    if (!transaction) {
      throw new PayMeException(-31003, "Transaction not found");
    }
    if (transaction.state === STATE_COMPLETED) {
      return res.status(200).json(this.makeResponse(req, {
        perform_time: Number(transaction.perform_time),
        transaction: String(transaction.id),
        state: STATE_COMPLETED
      }));
    }

    if (transaction.state != STATE_CREATED) {
      throw new PayMeException(-31008, "Transaction canceled");
    }
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();

    // New transaction:
    await queryRunner.startTransaction();

    try {
      // await this.getAccount(transaction.user.account_number);//Maybe not needed
      transaction = await this.transactionService.updateItem(transaction.id, {
        perform_time: moment().valueOf(),
        state: STATE_COMPLETED
      } as ITransaction);


      await queryRunner.commitTransaction();
      return res.status(200).json(this.makeResponse(req, {
          perform_time: Number(transaction.perform_time),
          transaction: String(transaction.id),
          state: STATE_COMPLETED
        }
      ));

    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new PayMeException(-31008, "Server error");
    }
  }

  private async cancelTransaction(req: Request, res: Response, next: NextFunction) {
    console.log("body -- ", JSON.stringify(req.body, null, 2));
    let transaction = await this.transactionService.getByPayComTransactionId(req.body.params.id);
    if (!transaction) {
      throw new PayMeException(-31003, "Transaction not found");
    }

    if (transaction.state === STATE_CREATED) {
      transaction = await this.transactionService.updateItem(transaction.id, {
        state: STATE_CANCELLED,
        cancel_time: moment().valueOf(),
        reason: req.body.params.reason
      } as ITransaction);
    } else if (transaction.state === STATE_COMPLETED) {
      transaction = await this.transactionService.updateItem(transaction.id, {
        state: STATE_CANCELLED_AFTER_COMPLETE,
        cancel_time: moment().valueOf(),
        reason: req.body.params.reason
      } as ITransaction);
    }


    return res.status(200).json(this.makeResponse(req, {
        cancel_time: Number(transaction.cancel_time),
        transaction: String(transaction.id),
        state: transaction.state,
        reason: transaction.reason
      }
    ));
  }

  private async checkTransaction(req: Request, res: Response, next: NextFunction) {
    const transaction = await this.transactionService.getByPayComTransactionId(req.body.params.id);
    if (!transaction) {
      throw new PayMeException(-31003, "Transaction not found");
    }
    return res.status(200).json(this.makeResponse(req, {
        create_time: Number(transaction.create_time),
        perform_time: Number(transaction.perform_time),
        cancel_time: Number(transaction.cancel_time),
        transaction: String(transaction.id),
        state: transaction.state,
        reason: transaction.reason || null
      })
    );
  }

  private async getStatement(req: Request, res: Response, next: NextFunction) {
    const transactionList = await this.transactionService.getList({
      where: {
        create_time: Between(req.body.params.from || 0, req.body.params.to)
      },
      order: {
        create_time: "ASC"
      },
      relations: ["user"]
    });

    const transactions = transactionList.map(t => ({
      id: t.paycom_transaction_id,
      time: Number(t.create_time),
      amount: t.amount,
      account: { account: t.user.account_number },
      create_time: Number(t.create_time),
      perform_time: Number(t.perform_time),
      cancel_time: Number(t.cancel_time),
      transaction: String(t.id),
      state: t.state,
      reason: t.reason || null,
      receivers: t.receivers
    } as any));

    return res.status(200).json(this.makeResponse(req, {
      ...transactions
    }));
  }

  private checkIsValidAmount(amount: number) {
    const isNotValid = amount > 50000000 || amount < 50000;
    if (isNotValid) {
      throw new PayMeException(-31001, "amount-out-of-range");
    }
    return !isNotValid;
  }

  public sendError = (message = null, code = 200, res: Response, req: Request) => {

    return res.status(200).send(this.makeResponse(req, null, { message, code }));
  };

  private async getAccount(account_number = null) {
    try {
      return await this.usersService.findUser({ account_number });
    } catch (e) {
      throw new PayMeException(-31099, "host-not-found");
    }
  }

  getUrl(host, amount) {
    const domain = "https://checkout.paycom.uz/";
    const encode = base64Decode(`m=${process.env.MERCHANT_ID};ac.host=${host};a=${(amount * 100)}`);
    return `${domain}${encode}`;
  }

  private makeResponse(req: Request, result: any, error?: any) {
    return {
      jsonrpc: "2.0",
      id: req.body.id,
      result,
      error
    };
  }
}

function base64Decode(str: string) {
  return Buffer.from(str, "base64").toString();

}

function sha1(data: string) {
  return crypto.createHash("sha1").update(data, "binary").digest("hex");
}

export default PayComTransactionController;
