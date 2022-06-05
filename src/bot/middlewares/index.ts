import { Telegraf } from "telegraf";
import LocalSession from "telegraf-session-local";

const localSession = new LocalSession();

export default function initMiddlewares(bot) {
  bot.use(Telegraf.log());
  bot.use(localSession.middleware());
  // bot.use(async (ctx, next) => {
  //   console.time(`Processing update ${ctx.update.update_id}`);
  //   await next(); // runs next middleware
  //   // runs after next middleware finishes
  //   console.timeEnd(`Processing update ${ctx.update.update_id}`);
  // });
  bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
  });

// Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

}
