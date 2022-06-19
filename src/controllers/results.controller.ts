import { NextFunction, Request, Response } from "express";
import testService from "@services/results.service";
import questionsService from "@services/questions.service";
import { QuestionEntity } from "@entities/questions.entity";
import resultsService from "@services/results.service";

class ResultController {
  public testService = new resultsService();

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllResultData = await this.testService.getAllResults();

      res.status(200).json({ data: findAllResultData, message: "findAll" });
    } catch (error) {
      next(error);
    }
  };

}

export default ResultController;
