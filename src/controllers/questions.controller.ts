import { NextFunction, Request, Response } from "express";
import { CreateQuestionsDto } from "@dtos/questions.dto";
import { OptionsEnum, Questions, TypeEnum } from "@interfaces/questions.interface";
import questionService from "@services/questions.service";

class QuestionsController {
  public questionService = new questionService();

  public getQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllQuestionsData: Questions[] = await this.questionService.findAllQuestion();

      res.status(200).json({ data: findAllQuestionsData, message: "findAll" });
    } catch (error) {
      next(error);
    }
  };

  public getQuestionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const questionId = Number(req.params.id);
      const findOneQuestionData: Questions = await this.questionService.findQuestionById(questionId);

      res.status(200).json({ data: findOneQuestionData, message: "findOne" });
    } catch (error) {
      next(error);
    }
  };

  public createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const questions = [];

      for (const file in req?.files) {
        const fileItem: Express.Multer.File = req.files[file];
        const isSample = fileItem.originalname.includes("sample");
        const originalName = fileItem.originalname;
        const chunks = originalName.replace("sample_", "").split("_");
        const questionData: CreateQuestionsDto = {
          number: Number(chunks[1]),
          correct_answer: chunks[2] as OptionsEnum,
          image: fileItem.filename,
          type: isSample ? TypeEnum.SAMPLE : TypeEnum.PAID,
          origin_test_name: originalName
        };

        const createQuestionData: Questions = await this.questionService.createQuestion(questionData);
        questions.push(createQuestionData);
      }


      res.status(201).json({ data: questions, message: "created" });
    } catch (error) {
      next(error);
    }
  };

  public updateQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const questionId = Number(req.params.id);
      const questionData: CreateQuestionsDto = req.body;
      const updateQuestionData: Questions = await this.questionService.updateQuestion(questionId, questionData);

      res.status(200).json({ data: updateQuestionData, message: "updated" });
    } catch (error) {
      next(error);
    }
  };

  public deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const questionId = Number(req.params.id);
      const deleteQuestionData: Questions = await this.questionService.deleteQuestion(questionId);

      res.status(200).json({ data: deleteQuestionData, message: "deleted" });
    } catch (error) {
      next(error);
    }
  };
}

export default QuestionsController;
