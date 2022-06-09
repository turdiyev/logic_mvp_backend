import AuthBotMiddlewares from "@/bot/middlewares/auth.bot.middlewares";
import BotTestAction from "@/bot/middlewares/test.bot.middlewares";
import ResultsBotAction from "@/bot/middlewares/results.bot.middlewares";


export default function initActions(bot) {
  const authActions = new AuthBotMiddlewares();
  const testActions = new BotTestAction();
  const resultsActions = new ResultsBotAction();

  bot.action("register_action", authActions.register);
  bot.action("start_test_action", testActions.startTest);
  bot.action("open_results", resultsActions.openResults);
  // bot.action("Javobni ko'rish", resultsActions.openResults);

  bot.action(/^([a-z])_option_selected_action$/, testActions.nextQuestion);
}
