import { Markup } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import { Results } from "@interfaces/results.interface";
import TestService from "@services/tests.service";
import moment from "moment";
import { DATE_TIME_FORMAT } from "@config";
import resultsService from "@services/results.service";

export default class ResultsBotMiddlewares {
  public testService = new TestService();
  public resultsService = new resultsService();

  public myResults = async (ctx: MyContext, next: any) => {
    const allTests = await this.testService.findUserTestsByTgId(ctx.from.id);

    const inlineButtons = [];
    allTests.forEach((test, ind) => {
      inlineButtons.push([
        Markup.button.callback(`${ind + 1}. ${moment(test.completed_at || test.updated_at || test.created_at)
          .format(DATE_TIME_FORMAT)}`, `open_test_result_${test.id}`)
      ]);
    });
    await ctx.replyWithHTML(`Yechilgan testlar ${inlineButtons.length ? `${inlineButtons.length} ta` : "mavjud emas"}`, {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard(inlineButtons)
    });
  };
  public openResults = async (ctx: MyContext, next: any) => {
    const completedTest = ctx.session.curTest;
    const results = completedTest.results as Results[];

    for await(const result of results) {
      await this.postResultItem(ctx, result);
    }
    ctx.session.curTest = null;
    ctx.reply("Natijalaringizni yuqorida ko'rishiz mumkin.", Markup.keyboard([
      Markup.button.callback("Bosh sahifaga qaytish", "go_home")
    ]).resize());
  };

  public openTestResultItem = async (ctx: MyContext, next: any) => {
    const action_name = ctx.callbackQuery?.data;
    const testId = Number(action_name.replace(/([a-zA-Z_])/g, "") || 0);


    const results = await this.resultsService.getTestResults(testId);

    for await(const result of results) {
      await this.postResultItem(ctx, result);
    }
  };


  public postResultItem = async (ctx: MyContext, result: Results) => {
    return await ctx.replyWithPhoto({ source: `./uploads/${result.question.image}` }, {
      caption: `<strong>${result.question.number}-savol</strong>  ${result.question.public_code ? `<code>(${result.question.public_code})</code>` : ""}`,
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        Markup.button.callback(printOption("A", result), "open_test_hint"),
        Markup.button.callback(printOption("B", result), "open_test_hint"),
        Markup.button.callback(printOption("C", result), "open_test_hint"),
        Markup.button.callback(printOption("D", result), "open_test_hint")
      ])
    });
  };
}

function printOption(option, result: Results) {
  const lowerOption = option.toLowerCase();

  return `${option} ${result.selected_option === lowerOption ? "🧑‍💼" : ""}${result.question.correct_answer === lowerOption ? "✅" : ""}${
    result.selected_option === lowerOption && result.selected_option !== result.question.correct_answer ? "❌" : ""}`;
}
