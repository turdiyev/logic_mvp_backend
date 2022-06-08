import { hash } from "bcrypt";
import { EntityRepository, Repository } from "typeorm";
import { CreateTestsDto } from "@dtos/tests.dto";
import { Status, TestEntity as TestEntity } from "@entities/test.entity";
import { HttpException } from "@exceptions/HttpException";
import { Tests } from "@interfaces/test.interface";
import { isEmpty } from "@utils/util";
import QuestionsService from "@services/questions.service";
import { Questions } from "@interfaces/questions.interface";
import { QuestionEntity as QuestionEntity } from "@entities/questions.entity";

@EntityRepository()
class TestService extends Repository<TestEntity> {
  questionService = new QuestionsService();

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

  async generateTest(questionCount = 30): Promise<Tests> {
    // if (isEmpty(testData)) throw new HttpException(400, "You're not testData");
    const questions = [];
    for await   (const [ind] of [...Array(questionCount).entries()]) {
      const item = await this.questionService.getRandomQuestion(ind + 1);
      if (isEmpty(item)) throw new HttpException(400, "Empty questions");

      questions.push(item);
    }
    if (isEmpty(questions)) throw new HttpException(400, "Empty questions");

    const data = {
      status: Status.PENDING,
      questions
    };
    const createQuestionData: Tests = await TestEntity.create(data).save();

    return createQuestionData;
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
