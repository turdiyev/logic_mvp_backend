import { EntityRepository, Repository } from "typeorm";
import { HttpException } from "@exceptions/HttpException";
import { Results } from "@interfaces/results.interface";
import { isEmpty } from "@utils/util";
import { OptionsEnum, Questions } from "@interfaces/questions.interface";
import { CreateResultsDto } from "@dtos/results.dto";
import { ResultEntity } from "@entities/result.entity";

@EntityRepository()
class ResultsService extends Repository<ResultEntity> {
  public async getAllResults(): Promise<any[]> {
    const results = await ResultEntity.createQueryBuilder("r")
      .select([
        "t.*",
        "jsonb_build_object('first_name', u.first_name,'last_name', u.last_name,'username', u.username, 'id', u.id) as user",
        "json_agg(jsonb_build_object('question_id', q.id,'result_id', r.id,'correct', q.correct_answer, 'selected', r.selected_option)) as results"

      ])
      .innerJoin("tests", "t", "t.id = r.test_id")
      .innerJoin("questions", "q", "q.id = r.question_id")
      .innerJoin("users", "u", "u.id = t.user_id")
      .groupBy("t.id")
      .addGroupBy("u.id")
      .getRawMany();
    return results;
  }

  public async findResultsById(resultId: number): Promise<Results> {
    if (isEmpty(resultId)) throw new HttpException(400, "You're not resultId");

    const findResults: Results = await ResultEntity.findOne({ where: { id: resultId } });
    if (!findResults) throw new HttpException(409, "You're not result");

    return findResults;
  }

  public async createResult(resultData: Results): Promise<Results> {
    try {
      if (isEmpty(resultData)) throw new HttpException(400, "You're not resultData");

      const created = await ResultEntity.create({ ...resultData }).save();

      return await ResultEntity.findOne({ where: { id: created.id }, relations: ["question"] });
    } catch (e) {
      console.log("ResultService: createResult --", e);
    }
  }

  public async saveByQuestion(testId: number, questionId: number, correctOption: string): Promise<void> {
    const data: Results = {
      selected_option: correctOption as OptionsEnum
    };
    await ResultEntity.update({
      test_id: testId,
      question_id: questionId
    }, data);
  }

  public async getTestResults(testId: number): Promise<Results[]> {
    return await ResultEntity.find({
      where: {
        test: { id: testId }
      },
      relations: ["question"],
      order: {
        id: "ASC"
      }
    });
  }


  public async updateResults(resultId: number, resultData: CreateResultsDto): Promise<Results> {
    if (isEmpty(resultData)) throw new HttpException(400, "You're not resultData");

    const updateResults: Results = await ResultEntity.findOne({ where: { id: resultId } });
    return updateResults;
  }

  public async deleteResults(resultId: number): Promise<Results> {
    if (isEmpty(resultId)) throw new HttpException(400, "You're not resultId");

    const findResults: Results = await ResultEntity.findOne({ where: { id: resultId } });
    if (!findResults) throw new HttpException(409, "You're not result");

    await ResultEntity.delete({ id: resultId });
    return findResults;
  }
}

export default ResultsService;
