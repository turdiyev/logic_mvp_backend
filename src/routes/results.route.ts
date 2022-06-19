import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import ResultsController from "@controllers/results.controller";

class ResultsRoute implements Routes {
  public path = '/mita-api/v1/results';
  public router = Router();
  public resultController = new ResultsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.resultController.getAll);
    // this.router.get(`${this.path}/:id(\\d+)`, this.testsController.getTestById);
    // this.router.post(`${this.path}`, this.testsController.createTest);
    // this.router.put(`${this.path}/:id(\\d+)`, validationMiddleware(CreateTestsDto, "body", true), this.testsController.updateTest);
    // this.router.delete(`${this.path}/:id(\\d+)`, this.testsController.deleteTest);
  }
}

export default ResultsRoute;
