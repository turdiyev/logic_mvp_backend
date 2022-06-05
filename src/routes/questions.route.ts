import { Router } from "express";
import QuestionsController from "@controllers/questions.controller";
import { CreateQuestionsDto } from "@dtos/questions.dto";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@middlewares/validation.middleware";
import multer from "multer";

const upload = multer({ dest: "./uploads/" });

class QuestionsRoute implements Routes {
  public path = "/questions";
  public router = Router();
  public questionsController = new QuestionsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.questionsController.getQuestions);
    this.router.get(`${this.path}/:id(\\d+)`, this.questionsController.getQuestionById);
    this.router.post(`${this.path}`, upload.array('photos', 15), this.questionsController.createQuestion);
    this.router.put(`${this.path}/:id(\\d+)`, validationMiddleware(CreateQuestionsDto, "body", true), this.questionsController.updateQuestion);
    this.router.delete(`${this.path}/:id(\\d+)`, this.questionsController.deleteQuestion);
  }
}

export default QuestionsRoute;
