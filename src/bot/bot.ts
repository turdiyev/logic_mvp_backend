import {  Telegraf } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import initActions from "@/bot/middlewares/actions";
import initListeners from "@/bot/middlewares/listeners";
import initMiddlewares from "@/bot/middlewares";

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN);
initMiddlewares(bot);
initListeners(bot);
initActions(bot);
