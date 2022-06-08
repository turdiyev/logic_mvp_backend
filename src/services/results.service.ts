import { EntityRepository, Repository } from "typeorm";
import { HttpException } from "@exceptions/HttpException";
import { Results } from "@interfaces/results.interface";
import { isEmpty } from "@utils/util";
import QuestionsService from "@services/questions.service";
import { OptionsEnum, Questions } from "@interfaces/questions.interface";
import { CreateResultsDto } from "@dtos/results.dto";
import { ResultEntity } from "@entities/result.entity";
import { User } from "@interfaces/users.interface";
import { UserEntity } from "@entities/users.entity";

@EntityRepository()
class ResultsService extends Repository<ResultEntity> {
  questionService = new QuestionsService();

  public async findAllResults(): Promise<Results[]> {
    const results: Results[] = await ResultEntity.find();
    return results;
  }

  public async findResultsById(resultId: number): Promise<Results> {
    if (isEmpty(resultId)) throw new HttpException(400, "You're not resultId");

    const findResults: Results = await ResultEntity.findOne({ where: { id: resultId } });
    if (!findResults) throw new HttpException(409, "You're not result");

    return findResults;
  }

  public async createResults(resultData: CreateResultsDto): Promise<Results> {
    if (isEmpty(resultData)) throw new HttpException(400, "You're not resultData");

    const createResultsData: Results = await ResultEntity.create({ ...resultData }).save();

    return createResultsData;
  }

  public async saveByQuestion(testId: number, questionId: number, correctOption: string): Promise<void> {
    const data: Results = {
      selected_option: correctOption as OptionsEnum
    };
    await ResultEntity.update( {
      test_id: testId,
      question_id: questionId
    } , data);
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
