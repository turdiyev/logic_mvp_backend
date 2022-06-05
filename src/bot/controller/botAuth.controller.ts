import { NextFunction, Request, Response } from "express";
import { CreateUserDto } from "@dtos/users.dto";
import { RequestWithUser } from "@interfaces/auth.interface";
import { User } from "@interfaces/users.interface";
import AuthService from "@services/auth.service";

class BotAuthController {
  public authService = new AuthService();

  public signInOrUp = async (body: CreateUserDto): Promise<User> => {
    try {
      const { findUser } = await this.authService.signUpOrIn(body);

      return findUser;
    } catch (error) {
      console.error("BotAuthController: signInOrUp", error)
    }
  };

  public signUp = async (body: CreateUserDto): Promise<User> => {
    try {
      const signUpUserData: User = await this.authService.signup(body);

      return signUpUserData;
    } catch (error) {
    }
  };

  public logIn = async (body: CreateUserDto): Promise<User> => {
    try {
      const { cookie, findUser } = await this.authService.login(body);

      return findUser;
    } catch (error) {
    }
  };

  public logOut = async (body: User): Promise<void> => {
    try {
      await this.authService.logout(body);

      // res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      // res.status(200).json({ data: logOutUserData, message: 'logout' });
    } catch (error) {
    }
  };
}

export default BotAuthController;
