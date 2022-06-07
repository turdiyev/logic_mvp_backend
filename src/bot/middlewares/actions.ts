import AuthBotMiddlewares from "@/bot/middlewares/auth.bot.middlewares";
import BotTestAction from "@/bot/middlewares/test.bot.middlewares";


export default function initActions (bot) {
  const authActions = new AuthBotMiddlewares()
  const testActions = new BotTestAction()

  bot.action("register_action", authActions.register);

  bot.action("start_test_action", testActions.startTest)
  bot.action(/^([a-z])_option_selected_action$/, testActions.nextQuestion)
}
