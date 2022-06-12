import { NextFunction, Request, Response } from "express";
import { getConnection } from "typeorm";
import crypto from "crypto";
import moment from "moment";
import payComTransactionService from "@services/paymeTransaction.service";
import { ITransaction } from "@interfaces/transaction.interface";
import usersService from "@services/users.service";

const STATE_CREATED = 1;
const STATE_COMPLETED = 2;
const STATE_CANCELLED = -1;
const STATE_CANCELLED_AFTER_COMPLETE = -2;

class PayComTransactionController {
  public usersService = new usersService();
  public transactionService = new payComTransactionService();

  public index = (req: Request, res: Response, next: NextFunction): void => {
    console.log("PayCOM .. index --- ", req.body, req.headers);
    if (!req.body) {
      this.sendError("Empty request", -32300, res);
    }
    if (!this.isLoggedIn(req.headers)) {
      return this.sendError("Incorrect login", -32504, res);
    }

    this.checkMethod(req, res, next);
  };

  private isLoggedIn(headers) {
    const authorization = headers["authorization"];
    if (!authorization) {
      return false;
    }
    const token = authorization.replace("Basic ", "");
    console.log("PayCom .. isLoggedIn -- ", base64Decode(token), process.env.PAYCOM_KEY, sha1(base64Decode(token)), sha1(`Paycom:${process.env.PAYCOM_KEY}`));

    if (sha1(base64Decode(token)) !== sha1(`Paycom:${process.env.PAYCOM_KEY}`)) {
      return false;
    }

    return true;
  }

  private checkMethod(req: Request, res: Response, next: NextFunction) {
    switch (req.body.method) {
      case "CheckPerformTransaction":
        this.checkPerformTransaction(req, res, next);
        break;
      case "CreateTransaction":
        this.createTransaction(req, res, next);
        break;
      case "PerformTransaction":
        this.performTransaction(req, res, next);
        break;
      case "CancelTransaction":
        this.cancelTransaction(req, res, next);
        break;
      case "CheckTransaction":
        this.checkTransaction(req, res, next);
        break;
      case "GetStatement":
        this.getStatement(req, res, next);
        break;

      default:
        this.sendError("Method not found", null, res);
    }
  }

  private checkPerformTransaction = (req: Request, res: Response, next: NextFunction) => {
    if (this.isValidAmount(req.body.params.amount, res)) {
      this.sendError("amount-out-of-range", -31001, res);
    }

    return res.status(200).json({ allow: true });
  };

  private async createTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const host = this.getHost(req.body.params?.account?.id_number as number, res);
      this.isValidAmount(req.body.params.amount, res);

      const { id, time, amount, ...rest } = req.body.params;
      const transaction = await this.transactionService.getOrCreate({
        user: host,
        create_time: time,
        paycom_transaction_id: id,
        state: STATE_CREATED,
        amount: amount,
        ...rest
      });
      return res.status(200).json({ data: transaction });
    } catch (e) {
      this.sendError("Server error", -31008, res);
    }
  }

  private async performTransaction(req: Request, res: Response, next: NextFunction) {
    const transaction = await this.transactionService.getById(req.body.params.id);
    if (!transaction) {
      this.sendError("Transaction not found", -31003, res);
    }
    if (transaction.state === STATE_COMPLETED) {
      return res.status(200).json({
        data: transaction
      });
    }

    if (transaction.state != STATE_CREATED) {
      this.sendError("Transaction canceled", -31008, res);
    }
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();

    // New transaction:
    await queryRunner.startTransaction();

    try {
      await this.transactionService.updateItem(transaction.id, {
        perform_time: moment().valueOf(),
        state: STATE_COMPLETED
      } as ITransaction);

      await queryRunner.commitTransaction();
      return res.status(200).json({
        data: {
          perform_time: transaction.perform_time,
          transaction: transaction.id,
          state: STATE_COMPLETED
        }
      });

    } catch (e) {
      await queryRunner.rollbackTransaction();
      this.sendError("Server error", -31008, res);
    }
  }

  private async cancelTransaction(req: Request, res: Response, next: NextFunction) {
    const transaction = await this.transactionService.getById(req.body.params.id);
    if (!transaction) {
      this.sendError("Transaction not found", -31003, res);
    }

    if (transaction.state === STATE_CREATED) {
      await this.transactionService.updateItem(transaction.id, {
        state: STATE_CANCELLED,
        cancel_time: moment().valueOf(),
        reason: req.body.reason
      } as ITransaction);
    } else if (transaction.state === STATE_COMPLETED) {
      await this.transactionService.updateItem(transaction.id, {
        state: STATE_CANCELLED_AFTER_COMPLETE,
        cancel_time: moment().valueOf(),
        reason: req.body.reason
      } as ITransaction);
    }


    return res.status(200).json({
      data: {
        cancel_time: transaction.cancel_time,
        transaction: transaction.id,
        state: transaction.state,
        reason: transaction.reason
      }
    });
  }

  private async checkTransaction(req: Request, res: Response, next: NextFunction) {
    const transaction = await this.transactionService.getById(req.body.params.id);
    if (!transaction) {
      this.sendError("Transaction not found", -31003, res);
    }
    return res.status(200).json({
      data: {
        create_time: transaction.create_time,
        perform_time: transaction.perform_time,
        cancel_time: transaction.cancel_time,
        transaction: transaction.id,
        state: transaction.state,
        reason: transaction.reason || null
      }
    });
  }

  private async getStatement(req: Request, res: Response, next: NextFunction) {
    const transactionList = await this.transactionService.getList();

    return res.status(200).json({
      data: transactionList
    });
  }

  private isValidAmount(amount: number, res) {
    const isValid = amount > 9999999900 || amount < 50000;
    if (isValid) {
      this.sendError("amount-out-of-range", -31001, res);
    }
    return isValid;
  }

  public sendError = (error = null, code = 500, res) => {
    // if (!Array.isArray(error)) {
    //   if (key_exists($error, this.t)) {
    //     $error = this.t[$error];
    //   } else {
    //     $msg = $error;
    //     $error = [];
    //     $error['uz'] = $error['ru'] = $error['en'] = $msg;
    //   }
    // }

    return res.status(500).send({ error, code });
    // this.send(null, ['code' => $code, 'message' => $error]);
    // throw new Error(error);
  };

  private async getHost(balanceId = null, res: Response) {
    const user = await this.usersService.findUser({ balance_id: balanceId });
    if (!user?.id) {
      this.sendError("host-not-found", -31099, res);
    }
    return user;

  }

  getUrl(host, amount) {
    const domain = "https://checkout.paycom.uz/";
    const encode = base64Decode(`m=${process.env.MERCHANT_ID};ac.host=${host};a=${(amount * 100)}`);
    return `${domain}${encode}`;
  }
}

function base64Decode(str: string) {
  return Buffer.from(str, "base64").toString();

}

function sha1(data: string) {
  return crypto.createHash("sha1").update(data, "binary").digest("hex");
}

export default PayComTransactionController;
