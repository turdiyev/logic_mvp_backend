import { Context, Markup, Telegraf } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import initActions from "@/bot/actions";
import initListeners from "@/bot/listeners";
import initMiddlewares from "@/bot/middlewares";

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN);
initListeners(bot);
initActions(bot);
initMiddlewares(bot);
