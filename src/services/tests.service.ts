import { EntityRepository, FindOneOptions, MoreThan, Repository } from "typeorm";
import { CreateTestsDto } from "@dtos/tests.dto";
import { Status, TestEntity as TestEntity } from "@entities/test.entity";
import { HttpException } from "@exceptions/HttpException";
import { Tests } from "@interfaces/test.interface";
import { isEmpty } from "@utils/util";
import QuestionsService from "@services/questions.service";
import { User } from "@interfaces/users.interface";
import moment from "moment";
import ResultsService from "@services/results.service";
import { Results } from "@interfaces/results.interface";
import { TypeEnum } from "@interfaces/questions.interface";

export interface TestWithStats extends Tests {
  stats?: { questionsCount: number; corrects: number; percentage: number };
};

@EntityRepository()
class TestService extends Repository<TestEntity> {
  questionService = new QuestionsService();
  resultService = new ResultsService();

  public async findAllTest(): Promise<Tests[]> {
    const tests: Tests[] = await TestEntity.find();
    return tests;
  }

  public async findTestById(testId: number): Promise<Tests> {
    if (isEmpty(testId)) throw new HttpException(400, "You're not testId");

    const findTest: Tests = await TestEntity.findOne({ where: { id: testId } });
    if (!findTest) throw new HttpException(409, "You're not test");

    return findTest;
  }

  public async findTestItem(options:FindOneOptions<any>): Promise<Tests> {

    const findTest: Tests = await TestEntity.findOne(options);
    if (!findTest) throw new HttpException(409, "You're not test");

    return findTest;
  }

  public async createTest(testData: Tests): Promise<Tests> {
    if (isEmpty(testData)) throw new HttpException(400, "You're not testData");

    const createTestData: Tests = await TestEntity.create({ ...testData }).save();

    return createTestData;
  }

  public async getExpenseTotalByUserId(userId: number): Promise<number> {
    const { total: userTotal } = await TestEntity.createQueryBuilder()
      .select("SUM(paid_for_test)", "total")
      .where({ user: { id: userId } })
      .getRawOne() as { total: string };
    return Number(userTotal || 0);
  }

  public generateTest = async (user: User, questionCount = 30, type: TypeEnum = TypeEnum.PAID): Promise<Tests> => {
    try {
      const test = await TestEntity.findOne({ user: { id: user.id } });

      const createdTest = await this.createTest({
        status: Status.PENDING,
        user
      });
      const results: Results[] = [];
      if (!Boolean(test)) {
        const sampleQuestions = await this.questionService.getSampleQuestions(30);
        for await (const question of sampleQuestions) {
          const resultPayload: Results = {
            question,
            test: createdTest,
            selected_option: null
          };
          const result = await this.resultService.createResult(resultPayload);
          results.push(result);
        }
      } else {
        for await (const [ind] of [...Array(questionCount).entries()]) {
          const question = await this.questionService.getRandomPaidQuestion(ind + 1, user.id);
          if (isEmpty(question)) throw new Error("Random questions not found");

          const resultPayload: Results = {
            question,
            test: createdTest,
            selected_option: null
          };
          const result = await this.resultService.createResult(resultPayload);
          results.push(result);
        }
      }
      await this.updateTest(createdTest.id, {
        paid_for_test: 20000 * 100
      });

      return { ...createdTest, results };
    } catch (e) {
      throw new Error("TestService..generateTest()" + e.toString());
    }
  };

  async completeTest(testId: number): Promise<TestWithStats> {
    try {
      await TestEntity.update(testId, {
        status: Status.COMPLETED,
        completedAt: moment().format()
      });
      // const test = await TestEntity.findOne(testId, {
      //   relations:['questions', 'results']
      // });
      const completedTest: TestWithStats = await TestEntity.findOne(testId, { relations: ["results", "results.question"] });
      if (isEmpty(completedTest?.id)) throw new HttpException(400, "Test is not found by testId: " + testId);
      console.log("completed Test", completedTest.id, completedTest.results);

      completedTest.stats = { questionsCount: completedTest.results.length, corrects: 0, percentage: 0 };
      completedTest.results.forEach((result) => {
        if (result.selected_option === result.question.correct_answer) {
          completedTest.stats.corrects += 1;
        }
      });
      completedTest.stats.percentage = (completedTest.stats.corrects / completedTest.results.length) * 100;

      return completedTest;
    } catch (e) {
      throw new Error("TestService..completeTest -" + e);
    }
  }

  public async updateTest(testId: number, testData: Partial<Tests>): Promise<void> {
    await TestEntity.update(testId, testData);
  }

  public async deleteTest(testId: number): Promise<Tests> {
    if (isEmpty(testId)) throw new HttpException(400, "You're not testId");

    const findTest: Tests = await TestEntity.findOne({ where: { id: testId } });
    if (!findTest) throw new HttpException(409, "You're not test");

    await TestEntity.delete({ id: testId });
    return findTest;
  }
}

export default TestService;
