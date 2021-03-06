import { EntityRepository, Repository } from "typeorm";
import { QuestionEntity as QuestionEntity } from "@entities/questions.entity";
import { HttpException } from "@exceptions/HttpException";
import { Questions } from "@interfaces/questions.interface";
import { isEmpty } from "@utils/util";
import { CreateQuestionsDto } from "@dtos/questions.dto";
import { User } from "@interfaces/users.interface";
import { UserEntity } from "@entities/users.entity";

@EntityRepository()
class QuestionsService extends Repository<QuestionEntity> {
  public async findAllQuestion(): Promise<Questions[]> {
    const questions: Questions[] = await QuestionEntity.find();
    return questions;
  }


  public async findQuestionById(questionId: number): Promise<Questions> {
    if (isEmpty(questionId)) throw new HttpException(400, "You're not questionId");

    const findQuestion: Questions = await QuestionEntity.findOne({ where: { id: questionId } });
    if (!findQuestion) throw new HttpException(409, "You're not question");

    return findQuestion;
  }

  public async getRandomQuestion(questionNumber: number, user: User): Promise<Questions> {
    try {
      const randomQuestion = await QuestionEntity.createQueryBuilder("q")
        .where("number = :number", { number: questionNumber })
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select("res.question_id")
            .from(UserEntity, "usr")
            .innerJoin("tests", "tst", "tst.user_id = usr.id")
            .innerJoin("results", "res", "res.test_id = tst.id")
            .getQuery();
          return "q.id NOT IN " + subQuery;
        })
        .orderBy("random()")
        .limit(1)
        .getOne();
      if (!randomQuestion) throw new Error("Question not found");

      return randomQuestion;
    } catch (e) {
      throw new Error("QuestionService..getRandomQuestion()" + e.toString());
    }
  }

  public async createQuestion(questionData: CreateQuestionsDto): Promise<Questions> {
    if (isEmpty(questionData)) throw new HttpException(400, "You're not questionData");

    const createQuestionData: Questions = await QuestionEntity.create({ ...questionData }).save();

    return createQuestionData;
  }

  public async updateQuestion(questionId: number, questionData: CreateQuestionsDto): Promise<Questions> {
    if (isEmpty(questionData)) throw new HttpException(400, "You're not questionData");

    const updateQuestion: Questions = await QuestionEntity.findOne({ where: { id: questionId } });
    return updateQuestion;
  }

  public async deleteQuestion(questionId: number): Promise<Questions> {
    if (isEmpty(questionId)) throw new HttpException(400, "You're not questionId");

    const findQuestion: Questions = await QuestionEntity.findOne({ where: { id: questionId } });
    if (!findQuestion) throw new HttpException(409, "You're not question");

    await QuestionEntity.delete({ id: questionId });
    return findQuestion;
  }
}

export default QuestionsService;
