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

  async generateTest(user: User, questionCount = 30): Promise<Tests> {
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
      user,
      questions
    };

    return await TestEntity.create(data).save();
  }

  async completeTest(testId: number): Promise<any> {
    await TestEntity.update(testId, {
      status: Status.COMPLETED,
      completedAt: moment().format()
    });
    // const test = await TestEntity.findOne(testId, {
    //   relations:['questions', 'results']
    // });
    const test = await ResultEntity.createQueryBuilder('r')
      // .select('res.selected_option','selected_option')
      .innerJoinAndSelect('r.test','t')
      .innerJoinAndSelect('r.question','q')
      // .innerJoin('questions', 'q', 'r.questions_id = q.id')
      // .where('t.id = :testId',{testId})
      .getMany()

    return test;
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
