import App from "@/app";
// import AuthRoute from "@routes/auth.route";
import IndexRoute from "@routes/index.route";
import UsersRoute from "@routes/users.route";
import TestsRoute from "@routes/tests.route";
// import ResultsRoute from "@routes/results.route";
// import QuestionsRoute from "@routes/questions.route";
import validateEnv from "@utils/validateEnv";
import "@/bot/bot";
import TransactionsRoute from "@routes/transactions.route";

validateEnv();


const app = new App([
  new IndexRoute(),
  new UsersRoute(),
  // new ResultsRoute(),
  // new QuestionsRoute(),
  new TestsRoute(),
  new TransactionsRoute(),
  // new AuthRoute(),
  ]);

app.listen();
