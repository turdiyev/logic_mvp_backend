import { Markup } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import { Results } from "@interfaces/results.interface";
import TestService from "@services/tests.service";
import moment from "moment";
import { DATE_TIME_FORMAT } from "@config";
import { Status } from "@entities/test.entity";

export default class ResultsBotMiddlewares {
  public testService = new TestService();

  public myResults = async (ctx: MyContext, next: any) => {
    const allTests = await this.testService.findUserTests(ctx.from.id);

    const inlineButtons = [];
    allTests.forEach((test, ind) => {
      inlineButtons.push([
        Markup.button.callback(`${ind}. ${moment(test.completedAt || test.updatedAt || test.createdAtAt)
          .format(DATE_TIME_FORMAT)}`, `open_test_result_${test.id}`)
      ]);
    });
    await ctx.replyWithHTML(`Men yechgan testlar`, {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard(inlineButtons),
      ...Markup.keyboard([
        Markup.button.callback("Bosh sahifaga qaytish", "go_home")
      ]).resize()
    });
  };
  public openResults = async (ctx: MyContext, next: any) => {
    const completedTest = ctx.session.curTest;
    const results = completedTest.results as Results[];

    for await(const result of results) {
      await this.postResultItem(ctx, result);
    }
    ctx.reply("Natijalaringizni yuqorida ko'rishiz mumkin. Yana test ishlash uchun menyudagi 'Yangi Test' tugmasini bosing.", Markup.keyboard([
      Markup.button.callback("Bosh sahifaga qaytish", "go_home")
    ]).resize());
  };

  public openTestResultItem = async (ctx: MyContext, next: any) => {
    const action_name = ctx.callbackQuery?.data;
    const testId = Number(action_name.replace(/([a-zA-Z_])/g, "") || 0);


    const testItem = await this.testService.findTestItem({
      where: { id: testId },
      relations: ["results", "results.question"]
    });
    const results = testItem.results as Results[];


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
