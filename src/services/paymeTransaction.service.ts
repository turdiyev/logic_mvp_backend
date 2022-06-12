import { compare, hash } from "bcrypt";
import { EntityRepository, Repository } from "typeorm";
import { HttpException } from "@exceptions/HttpException";
import { ITransaction } from "@interfaces/transaction.interface";
import { isEmpty } from "@utils/util";
import { TransactionEntity } from "@entities/transaction.entity";
import { CreateTestsDto } from "@dtos/tests.dto";
import { Tests } from "@interfaces/test.interface";
import { TestEntity } from "@entities/test.entity";

@EntityRepository()
class PaymeTransactionService extends Repository<ITransaction> {
  public async getList(): Promise<ITransaction[]> {
    return await TransactionEntity.find();
  }

  public async getById(id: number): Promise<ITransaction> {
    if (isEmpty(id)) throw new HttpException(400, "You're not id");

    const item = await TransactionEntity.findOne({ where: { id: id }, relations: ["user"] });
    if (!item) throw new HttpException(409, "You're not test");

    return item;
  }

  public async getOrCreate(data: ITransaction): Promise<ITransaction> {
    // if (isEmpty(data.id))  throw new HttpException(400, "You're not id");
    let item: ITransaction = await TransactionEntity.findOne({
      where: { paycom_transaction_id: data.paycom_transaction_id },
      relations: ["user"]
    });
    console.log("getOrCreaate..find() --", item);
    if (!item) {
      item = await this.createItem(data);
      console.log("getOrCreaate..create() --", item);
    }

    return item;
  }

  public async createItem(data: ITransaction): Promise<ITransaction> {
    try {
      if (isEmpty(data))
        throw new HttpException(400, "You're not testData");

      const createdItem = await TransactionEntity.create({ ...data }).save();
      return await TransactionEntity.findOne(createdItem.id, { relations: ["user"] });
    } catch (e) {
      console.error("createItem  --- ", e);
    }
  }

  public async updateItem(testId: number, data: ITransaction): Promise<void> {
    if (isEmpty(data))
      throw new HttpException(400, "You're not testData");

    await TransactionEntity.update(testId, data);
  }
}

export default PaymeTransactionService;
