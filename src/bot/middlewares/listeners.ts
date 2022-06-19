import { Telegraf } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import AuthBotMiddlewares from "@/bot/middlewares/auth.bot.middlewares";
import BotTestAction from "@/bot/middlewares/test.bot.middlewares";
import ResultsBotMiddlewares from "@/bot/middlewares/results.bot.middlewares";


export default function initListeners(bot: Telegraf<MyContext>) {
  const authActions = new AuthBotMiddlewares();
  const testActions = new BotTestAction();
  const resultsActions = new ResultsBotMiddlewares();

  bot.start(authActions.welcome);
  bot.hears("Ro`yxatdan o`tish", authActions.register);
  bot.hears("Testni boshlash", testActions.startTest);
  bot.hears("Nimaga pulli?", testActions.postWhyPaid);
  bot.hears("Bosh sahifaga qaytish", authActions.welcome);

  bot.hears("Yechilgan testlar", resultsActions.myResults);
  bot.hears("Javoblarni ko'rish", resultsActions.openResults);
  bot.hears("Yangi Test", testActions.startTest);
  bot.hears(/^([ABCDabcd])$/i, testActions.nextQuestion);

  bot.help((ctx) => ctx.reply("Send me a sticker"));
  bot.on("sticker", (ctx) => ctx.reply("👍"));
  bot.hears("hi", (ctx) => {
    ctx.reply("Hey there");
  });
  bot.launch().catch(e => console.error("bot---", e));

}
