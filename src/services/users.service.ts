import { hash } from "bcrypt";
import { EntityRepository, Repository } from "typeorm";
import { CreateUserDto } from "@dtos/users.dto";
import { UserEntity } from "@entities/users.entity";
import { HttpException } from "@exceptions/HttpException";
import { User } from "@interfaces/users.interface";
import { isEmpty } from "@utils/util";
import { WhereClause } from "typeorm/query-builder/WhereClause";
import PaymeTransactionService from "@services/paymeTransaction.service";
import TestService from "@services/tests.service";
import { parseToSOM } from "@utils/paymentUtils";

@EntityRepository()
class UserService extends Repository<UserEntity> {
  transactionService = new PaymeTransactionService();
  testService = new TestService();

  public async findAllUser(): Promise<User[]> {
    const users: User[] = await UserEntity.find();
    return users;
  }

  public async findUser(user: Partial<User>): Promise<User> {
    const findUser: User = await UserEntity.findOne({ where: { ...user } });
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  public async getUserBalanceInSOM(userTelegramId: number): Promise<number> {
    const user = await UserEntity.createQueryBuilder()
      .select(['id', 'initial_balance'])
      .where({ telegram_user_id: userTelegramId })
      .getRawOne();
    const paymentsTotal = await this.transactionService.getTotalByUserId(user.id);
    const expenseTotal = await this.testService.getExpenseTotalByUserId(user.id);

    const bonusBalance = Number(user.initial_balance);

    return parseToSOM(bonusBalance + paymentsTotal - expenseTotal);
  }

  public async findUserById(userId: number): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  public async findUserByTgId(telegramUserId: number): Promise<User> {
    const findUser: User = await UserEntity.findOne({
      where: { telegram_user_id: Number(telegramUserId) }
    });
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await UserEntity.findOne({ where: { username: userData.username } });
    if (findUser) throw new HttpException(409, `You're email ${userData.username} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    return await UserEntity.create({ ...userData, password: hashedPassword }).save();
  }

  public async updateUser(userId: number, userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not user");

    const hashedPassword = await hash(userData.password, 10);
    await UserEntity.update(userId, { ...userData, password: hashedPassword });

    return await UserEntity.findOne({ where: { id: userId } });
  }

  public async deleteUser(userId: number): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not user");

    await UserEntity.delete({ id: userId });
    return findUser;
  }
}

export default UserService;
