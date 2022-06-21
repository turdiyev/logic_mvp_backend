import { NextFunction, Request, Response } from 'express';
import { CreateTestsDto } from '@dtos/tests.dto';
import { Tests } from '@interfaces/test.interface';
import testService from '@services/tests.service';
import questionsService from '@services/questions.service';
import { QuestionEntity } from '@entities/questions.entity';
import { renderComp } from '../react/server/render';
import { PageableResponse } from '../services/tests.service';

class TestsController {
  public testService = new testService();
  public questionService = new questionsService();

  public getTestsWithResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pageableTestsData: PageableResponse<Tests> = await this.testService.findPageableTestsResults(Number(req.query.page || 1));
      const curPath = req.path;
      
      const html = renderComp({ data: pageableTestsData, curPath, routeName: 'test-list' });
      res
        .set(
          'Content-Security-Policy',
          "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'",
        )
        .send(html);
      // res.status(200).json({ data: findAllTestsData, message: "findAll" });
    } catch (error) {
      next(error);
    }
  };
  public getTestsWithResults2 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllTestsData: Tests[] = await this.testService.findTestsWithResults();

      res.status(200).json({ data: findAllTestsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getTests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllTestsData: Tests[] = await this.testService.findAllTest();

      res.status(200).json({ data: findAllTestsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getTestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const testId = Number(req.params.id);
      const findOneTestData: Tests = await this.testService.findTestById(testId);

      res.status(200).json({ data: findOneTestData, message: 'findOne' });
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

      res.status(200).json({ data: { success: true }, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const testId = Number(req.params.id);
      const deleteTestData: Tests = await this.testService.deleteTest(testId);

      res.status(200).json({ data: deleteTestData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}

export default TestsController;
