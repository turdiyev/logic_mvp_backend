import { EntityRepository, FindOneOptions, MoreThan, Repository } from 'typeorm';
import { Status, TestEntity as TestEntity } from '@entities/test.entity';
import { HttpException } from '@exceptions/HttpException';
import { Tests } from '@interfaces/test.interface';
import { isEmpty } from '@utils/util';
import QuestionsService from '@services/questions.service';
import moment from 'moment';
import ResultsService from '@services/results.service';
import { Results } from '@interfaces/results.interface';
import { ONE_TEST_PRICE } from '@config';
import { UserEntity } from '@entities/users.entity';
import { parseToTiyin } from '@utils/paymentUtils';
import { ResultEntity } from '@entities/result.entity';
import { PAGE_LIMIT } from '../config';

export interface TestWithStats extends Tests {
  stats?: { questionsCount: number; corrects: number; percentage: number };
}
export type PageableResponse<T> = { items: T[]; total: number; page: number };
@EntityRepository()
class TestService extends Repository<TestEntity> {
  questionService = new QuestionsService();
  resultService = new ResultsService();

  public async findTestsWithResults(page = 1): Promise<Tests[]> {
    const results = await TestEntity.createQueryBuilder('t')
      .select([
        't.*',
        "jsonb_build_object('first_name', u.first_name,'last_name', u.last_name,'username', u.username, 'id', u.id) as user",
        "json_agg(jsonb_build_object('number', q.number,'question_id', q.id,'result_id', r.id,'correct', q.correct_answer, 'selected', r.selected_option)) as results",
      ])
      .distinctOn(['t.*'])
      .leftJoin('results', 'r', 'r.test_id = t.id')
      .leftJoin('questions', 'q', 'q.id = r.question_id')
      .leftJoin('users', 'u', 'u.id = t.user_id')
      .groupBy('t.id')
      .addGroupBy('u.id')
      .limit(PAGE_LIMIT)
      .offset((page - 1) * PAGE_LIMIT)
      .getRawMany<Tests>();

    return results;
  }
  public async findPageableTestsResults(page = 1): Promise<PageableResponse<Tests>> {
    const results = await this.findTestsWithResults(page);

    const {count} = await TestEntity.createQueryBuilder('t')
      .select(['count(t.*) as count'])
      .getRawOne<number>();
    console.log('Tests TOTAL -- ', count, results);
    return { items: results, total: Number(count), page };
  }

  public async findAllTest(): Promise<Tests[]> {
    return await TestEntity.find();
  }

  public async findUserTestsByTgId(telegram_user_id: number): Promise<Tests[]> {
    return await TestEntity.createQueryBuilder('t')
      .select('t.*')
      .innerJoin(UserEntity, 'u', 'u.id = t.user_id')
      .where('u.telegram_user_id = :telegram_user_id', { telegram_user_id })
      .orderBy('t.updated_at', 'ASC')
      .getRawMany<Tests>();
  }

  public async findTestById(testId: number): Promise<Tests> {
    if (isEmpty(testId)) throw new HttpException(400, "You're not testId");

    const findTest: Tests = await TestEntity.findOne({ where: { id: testId } });
    if (!findTest) throw new HttpException(409, "You're not test");

    return findTest;
  }

  public async getTestsStat(): Promise<any> {
    const completedTests = await TestEntity.count({ where: { status: Status.COMPLETED } });
    const allTests = await TestEntity.count();

    return {
      completed: completedTests || 0,
      all: allTests || 0,
    };
  }

  public async findTestItem(options: FindOneOptions<any>): Promise<Tests> {
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
    const { total: userTotal } = (await TestEntity.createQueryBuilder()
      .select('SUM(paid_for_test)', 'total')
      .where({ user: { id: userId } })
      .getRawOne()) as { total: string };
    return Number(userTotal || 0);
  }

  public generateTest = async (telegram_user_id: number, questionCount = 30): Promise<Tests> => {
    try {
      const user = await UserEntity.findOne({
        where: {
          telegram_user_id,
        },
      });
      const test = await TestEntity.findOne({ user: { id: user.id }, paid_for_test: MoreThan(0) });

      const createdTest = await this.createTest({
        status: Status.PENDING,
        user,
      });
      const results: Results[] = [];

      console.log(' is First -- ', !Boolean(test), test, user);
      if (!Boolean(test)) {
        //user's first test condition
        const sampleQuestions = await this.questionService.getSampleQuestions(questionCount);
        if (sampleQuestions.length !== questionCount) throw new Error('Sample questions is not found');

        for await (const question of sampleQuestions) {
          const resultPayload: Results = {
            question,
            test: createdTest,
            selected_option: null,
          };
          const result = await this.resultService.createResult(resultPayload);
          results.push(result);
        }
      } else {
        for await (const [ind] of [...Array(questionCount).entries()]) {
          const question = await this.questionService.getRandomPaidQuestion(ind + 1, telegram_user_id);
          if (isEmpty(question)) throw new Error('Random questions not found');

          const resultPayload: Results = {
            question,
            test: createdTest,
            selected_option: null,
          };
          const result = await this.resultService.createResult(resultPayload);
          results.push(result);
        }
      }
      if (results.length !== questionCount) throw new Error('Questions is not found');

      await this.updateTest(createdTest.id, {
        paid_for_test: parseToTiyin(ONE_TEST_PRICE),
      });

      return { ...createdTest, results };
    } catch (e) {
      throw new Error('TestService..generateTest()' + e.toString());
    }
  };

  async completeTest(testId: number): Promise<TestWithStats> {
    try {
      await TestEntity.update(testId, {
        status: Status.COMPLETED,
        completed_at: moment().format(),
      });
      // const test = await TestEntity.findOne(testId, {
      //   relations:['questions', 'results']
      // });
      const completedTest: TestWithStats = await TestEntity.findOne(testId, { relations: ['results', 'results.question'] });
      if (isEmpty(completedTest?.id)) throw new HttpException(400, 'Test is not found by testId: ' + testId);
      console.log('completed Test', completedTest.id, completedTest.results);

      completedTest.stats = { questionsCount: completedTest.results.length, corrects: 0, percentage: 0 };
      completedTest.results.forEach(result => {
        if (result.selected_option === result.question.correct_answer) {
          completedTest.stats.corrects += 1;
        }
      });
      completedTest.stats.percentage = (completedTest.stats.corrects / completedTest.results.length) * 100;

      return completedTest;
    } catch (e) {
      throw new Error('TestService..completeTest -' + e);
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
