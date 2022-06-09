import { NextFunction, Request, Response } from 'express';
import { CreateTestsDto } from '@dtos/tests.dto';
import testsService, { TestWithStats } from "@services/tests.service";
import { Tests } from "@interfaces/test.interface";
import { User } from "@interfaces/users.interface";
import resultsService from "@services/results.service";

class TestsBotController {
  public testService = new testsService();
  public resultService = new resultsService();

  public generateTest = async (user:User,questionsCount?: number): Promise<Tests> => {
      const generatedTest: Tests = await this.testService.generateTest(user,questionsCount);

      return generatedTest
  };
  public completeTest = async (testId:number): Promise<TestWithStats> => {
      const completedTest: Tests = await this.testService.completeTest(testId);
      // const generatedTest: Tests = await this.resu.completeTest(testId);

      return completedTest
  };
}

export default TestsBotController;
