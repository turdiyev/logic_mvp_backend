import { NextFunction, Request, Response } from "express";
import { CreateTestsDto } from "@dtos/tests.dto";
import { Tests } from "@interfaces/test.interface";
import testService from "@services/tests.service";
import questionsService from "@services/questions.service";
import { QuestionEntity } from "@entities/questions.entity";

class TestsController {
  public testService = new testService();
  public questionService = new questionsService();

  public getTestsWithResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllTestsData: Tests[] = await this.testService.findTestsWithResults();

      res.status(200).json({ data: findAllTestsData, message: "findAll" });
    } catch (error) {
      next(error);
    }
  };

  public getTests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllTestsData: Tests[] = await this.testService.findAllTest();

      res.status(200).json({ data: findAllTestsData, message: "findAll" });
    } catch (error) {
      next(error);
    }
  };


  public getTestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const testId = Number(req.params.id);
      const findOneTestData: Tests = await this.testService.findTestById(testId);

      res.status(200).json({ data: findOneTestData, message: "findOne" });
    } catch (error) {
      next(error);
    }
  };

  public createTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {


      // res.status(201).json({ data: tests, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const testId = Number(req.params.id);
      const testData: CreateTestsDto = req.body;
      await this.testService.updateTest(testId, testData);

      res.status(200).json({ data: { success: true }, message: "updated" });
    } catch (error) {
      next(error);
    }
  };

  public deleteTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const testId = Number(req.params.id);
      const deleteTestData: Tests = await this.testService.deleteTest(testId);

      res.status(200).json({ data: deleteTestData, message: "deleted" });
    } catch (error) {
      next(error);
    }
  };
}

export default TestsController;
