import {  Telegraf } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import AuthBotMiddlewares from "@/bot/middlewares/auth.bot.middlewares";
import BotTestAction from "@/bot/middlewares/test.bot.middlewares";


export default function initListeners(bot: Telegraf<MyContext>) {
  const authActions = new AuthBotMiddlewares();
  const testActions = new BotTestAction();

  bot.start(authActions.welcome);


  bot.help((ctx) => ctx.reply("Send me a sticker"));
  bot.on("sticker", (ctx) => ctx.reply("👍"));
  bot.hears("hi", (ctx) => {
    ctx.reply("Hey there");
  });
  bot.launch().catch(e => console.error("bot---", e));

}
