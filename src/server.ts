import App from "@/app";
import AuthRoute from "@routes/auth.route";
import IndexRoute from "@routes/index.route";
import UsersRoute from "@routes/users.route";
import TestsRoute from "@routes/tests.route";
import QuestionsRoute from "@routes/questions.route";
import validateEnv from "@utils/validateEnv";
import "@/bot/bot";

validateEnv();


const app = new App([
  new IndexRoute(),
  new UsersRoute(),
  new QuestionsRoute(),
  new TestsRoute(),
  new AuthRoute()
  ]);

app.listen();
