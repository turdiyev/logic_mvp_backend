import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { EntityRepository, Repository } from "typeorm";
import { SECRET_KEY } from "@config";
import { CreateUserDto } from "@dtos/users.dto";
import { UserEntity } from "@entities/users.entity";
import { HttpException } from "@exceptions/HttpException";
import { DataStoredInToken, TokenData } from "@interfaces/auth.interface";
import { User } from "@interfaces/users.interface";
import { isEmpty } from "@utils/util";

@EntityRepository()
class AuthService extends Repository<UserEntity> {
  public async signup(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await UserEntity.findOne({ where: { username: userData.username } });
    if (findUser) throw new HttpException(409, `You're username ${userData.username} already exists`);
    const { max: maxAccountNumber } = await UserEntity.createQueryBuilder("u")
      .select("MAX(u.account_number)", "max")
      .getRawOne();


    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await UserEntity.create({
      ...userData,
      password: hashedPassword,
      account_number: (maxAccountNumber + 1) || 11982343
    }).save();
    return createUserData;
  }

  public async login(userData: CreateUserDto): Promise<{ cookie: string; findUser: User }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await UserEntity.findOne({ where: { username: userData.username } });
    if (!findUser) throw new HttpException(409, `You're username ${userData.username} not found`);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);

    return { cookie, findUser };
  }

  public async signUpOrIn(userData: CreateUserDto): Promise<{ cookie: string; findUser: User }> {
    try {
      if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

      let findUser: User = await UserEntity.findOne({ where: { username: userData.username } });
      if (!findUser) {
        findUser = await this.signup(userData);
      }

      const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
      if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

      // const tokenData = this.createToken(findUser);
      // const cookie = this.createCookie(tokenData);
      return { cookie: null, findUser };
    } catch (e) {
      throw new Error(e);
    }
  }

  public async logout(userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await UserEntity.findOne({
      where: {
        username: userData.username,
        password: userData.password
      }
    });
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user.id };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 60 * 60;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
