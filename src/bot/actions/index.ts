import BotAuthAction from "@/bot/actions/botAuth.action";
import BotTestAction from "@/bot/actions/test.bot.action";


export default function initActions (bot) {
  const authActions = new BotAuthAction()
  const testActions = new BotTestAction()

  bot.action("register_action", authActions.register);

  bot.action("start_test_action", testActions.startTest)
  bot.action("a_start_test_action", testActions.startTest)
}
