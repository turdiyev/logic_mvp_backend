import { Markup } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import TestController from "@/bot/controller/test.bot.controller";
import ResultsBotController from "@/bot/controller/results.bot.controller";
import { Results } from "@interfaces/results.interface";

export default class ResultsBotMiddlewares {
  public testController = new TestController();
  public resultController = new ResultsBotController();


  public openResults = async (ctx: MyContext, next: any) => {
    // await ctx.answerCbQuery('sdfa adsfa fadsfad fasd');
    const completedTest = ctx.session.curTest;
    const results = completedTest.results as Results[];
    // if (ctx?.answerCbQuery) ctx.answerCbQuery();

    for await(const [_, result] of [...results.entries()]) {
      await ctx.replyWithPhoto({ source: `./uploads/${result.question.image}` }, {
        caption: `<strong>${result.question.number}-savol</strong>(${completedTest.id}-test)`,
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          Markup.button.callback(printOption("A", result), "open_test_hint"),
          Markup.button.callback(printOption("B", result), "open_test_hint"),
          Markup.button.callback(printOption("C", result), "open_test_hint"),
          Markup.button.callback(printOption("D", result), "open_test_hint")
        ])
      });
    }
    ctx.reply("Natijalaringizni yuqorida ko'rishiz mumkin. Yana test ishlash uchun menyudagi 'Yangi Test' tugmasini bosing.", Markup.keyboard([
      Markup.button.callback("Yangi Test", 'start_test_action')
    ]).resize());
  };
}

function printOption(option, result: Results) {
  const lowerOption = option.toLowerCase();

  return `${option} ${result.question.correct_answer === lowerOption ? "✅" : ""}${
    result.selected_option === lowerOption && result.selected_option !== result.question.correct_answer ? "❌" : ""}`;
}
