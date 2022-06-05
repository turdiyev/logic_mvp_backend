import { Router } from "express";
import TestsController from "@controllers/tests.controller";
import { CreateTestsDto } from "@dtos/tests.dto";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@middlewares/validation.middleware";

class TestsRoute implements Routes {
  public path = "/tests";
  public router = Router();
  public testsController = new TestsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.testsController.getTests);
    this.router.get(`${this.path}/:id(\\d+)`, this.testsController.getTestById);
    this.router.post(`${this.path}`, this.testsController.createTest);
    this.router.put(`${this.path}/:id(\\d+)`, validationMiddleware(CreateTestsDto, "body", true), this.testsController.updateTest);
    this.router.delete(`${this.path}/:id(\\d+)`, this.testsController.deleteTest);
  }
}

export default TestsRoute;
