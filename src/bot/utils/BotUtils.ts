import { MyContext } from "@/bot/bot.interfaces";

export default class BotUtils {
  static async answerCBQuery(ctx: MyContext, msg?:string) {
    if (ctx.callbackQuery?.data && ctx.answerCbQuery) await ctx.answerCbQuery(msg);
  }
}
