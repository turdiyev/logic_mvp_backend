import { EntityRepository, Repository } from "typeorm";
import { CreateTestsDto } from "@dtos/tests.dto";
import { Status, TestEntity as TestEntity } from "@entities/test.entity";
import { HttpException } from "@exceptions/HttpException";
import { Tests } from "@interfaces/test.interface";
import { isEmpty } from "@utils/util";
import QuestionsService from "@services/questions.service";
import { User } from "@interfaces/users.interface";
import moment from "moment";
import { ResultEntity } from "@entities/result.entity";
import ResultsService from "@services/results.service";
import resultsService from "@services/results.service";
import { Results } from "@interfaces/results.interface";


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

  public async createTest(testData: CreateTestsDto): Promise<Tests> {
    if (isEmpty(testData)) throw new HttpException(400, "You're not testData");

    const createTestData: Tests = await TestEntity.create({ ...testData }).save();

    return createTestData;
  }

  public generateTest = async (user: User, questionCount = 30): Promise<Tests> => {
    // if (isEmpty(testData)) throw new HttpException(400, "You're not testData");
    try {
      const data: Tests = {
        status: Status.PENDING,
        user
      };

      const createdTest = await TestEntity.create(data).save();
      const results: Results[] = [];
      for await   (const [ind] of [...Array(questionCount).entries()]) {
        const question = await this.questionService.getRandomQuestion(ind + 1);
        if (isEmpty(question)) throw new HttpException(400, "Empty questions");

        const resultPayload: Results = {
          question,
          test: createdTest,
          selected_option: null
        };
        const result = await this.resultService.createResult(resultPayload);
        results.push(result);
      }
      if (isEmpty(results)) throw new HttpException(400, "Empty questions");
      return { ...createdTest, results };
    } catch (e) {
      console.log("TestService: generateTest --", e);
    }
  };

  async completeTest(testId: number): Promise<any> {
    await TestEntity.update(testId, {
      status: Status.COMPLETED,
      completedAt: moment().format()
    });
    // const test = await TestEntity.findOne(testId, {
    //   relations:['questions', 'results']
    // });
    return await TestEntity.findOne(testId, { relations: ["results", "results.question"] });
  }

  public async updateTest(testId: number, testData: CreateTestsDto): Promise<Tests> {
    if (isEmpty(testData)) throw new HttpException(400, "You're not testData");

    const updateTest: Tests = await TestEntity.findOne({ where: { id: testId } });
    return updateTest;
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
