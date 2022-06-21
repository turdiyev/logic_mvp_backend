import { NextFunction, Request, Response } from "express";
import React from "react";

import usersService from "@services/users.service";
import testsService from "@services/tests.service";
import paymeTransactionService from "@services/paymeTransaction.service";
import questionsService from "@services/questions.service";
import { renderComp } from "../views/server/render";

class IndexController {
  public questionService = new questionsService();
  public userService = new usersService();
  public testService = new testsService();
  public transactionService = new paymeTransactionService();
  public index = (req: Request, res: Response, next: NextFunction): void => {
    try {
     const html = renderComp()
      res.send(html);
    } catch (error) {
      next(error);
    }
  };
  public getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usersTotal = await this.userService.getUsersTotal();
      const testsStat = await this.testService.getTestsStat();
      const transactionsTotal = await this.transactionService.getTotal();
      const questionTotal = await this.questionService.getTotal();

      res.send({
        users: usersTotal || 0,
        tests: testsStat,
        transactions: transactionsTotal || 0,
        questions: questionTotal || 0
      });
    } catch (error) {
      next(error);
    }
  };
}

export default IndexController;
