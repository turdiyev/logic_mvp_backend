import { NextFunction, Request, Response } from 'express';
import { CreateTestsDto } from '@dtos/tests.dto';
import testsService from "@services/tests.service";
import { Tests } from "@interfaces/test.interface";

class TestsController {
  public testService = new testsService();

  public generateTest = async (questionsCount?: number): Promise<Tests> => {
    // try {
      const generatedTest: Tests = await this.testService.generateTest(questionsCount);

      return generatedTest
    // } catch (error) {
    //   console.log(error);
    // }
  };

  // public getTestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const testId = Number(req.params.id);
  //     const findOneTestData: CreateTestsDto = await this.testService.findTestById(testId);
  //
  //     res.status(200).json({ data: findOneTestData, message: 'findOne' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
  //
  // public createTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const testData: CreateTestsDto = req.body;
  //     const createTestData: CreateTestsDto = await this.testService.createTest(testData);
  //
  //     res.status(201).json({ data: createTestData, message: 'created' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
  //
  // public updateTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const testId = Number(req.params.id);
  //     const testData: CreateTestsDto = req.body;
  //     const updateTestData: CreateTestsDto = await this.testService.updateTest(testId, testData);
  //
  //     res.status(200).json({ data: updateTestData, message: 'updated' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
  //
  // public deleteTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const testId = Number(req.params.id);
  //     const deleteTestData: CreateTestsDto = await this.testService.deleteTest(testId);
  //
  //     res.status(200).json({ data: deleteTestData, message: 'deleted' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}

export default TestsController;
