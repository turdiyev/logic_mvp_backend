import { NextFunction, Request, Response } from "express";
import usersService from "@services/users.service";
import testsService from "@services/tests.service";

class IndexController {
  public userService = new usersService();
  public testService = new testsService();
  public index = (req: Request, res: Response, next: NextFunction): void => {
    try {
      res.send({ hie: 324324 });
    } catch (error) {
      next(error);
    }
  };
  public getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usersTotal = await this.userService.getUsersTotal();
      const testsStat = await  this.testService.getTestsStat();
      res.send({ users: usersTotal || 0, tests: testsStat });
    } catch (error) {
      next(error);
    }
  };
}

export default IndexController;
