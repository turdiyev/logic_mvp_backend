import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import PayComTransactionController from "@controllers/payComTransaction.controller";

class PayComTransactionRoute implements Routes {
  public path = "/payme";
  public router = Router();
  public transactionController = new PayComTransactionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, this.transactionController.index);
  }
}

export default PayComTransactionRoute;
