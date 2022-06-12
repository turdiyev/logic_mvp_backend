import { Markup } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import TestController from "@/bot/controller/test.bot.controller";
import { Tests } from "@interfaces/test.interface";
import ResultsBotController from "@/bot/controller/results.bot.controller";
import moment from "moment";
import { TestWithStats } from "@services/tests.service";
import BotUtils from "@/bot/utils/BotUtils";

export default class BotTestAction {
  public testController = new TestController();
  public resultController = new ResultsBotController();

  public startTest = async (ctx: MyContext, next) => {
    try {
      const test = await this.testController.generateTest(ctx.session.currentUser, 3);
      BotUtils.answerCBQuery(ctx, "Test boshlandi");
      ctx.session.curTest = test as Tests;
      ctx.session.questionsQueue = test.results.map(r => r.question);
      this.nextQuestion(ctx, next);
    } catch (e) {
      console.log("Bot TestAction: startTest---", e);
      BotUtils.answerCBQuery(ctx, "👍 Tabriklaymiz. Siz hozirda bor test savollarini ishlab chiqdingiz.");
    }
  };


  public nextQuestion = async (ctx: MyContext, next: any) => {
    console.log("nex---", JSON.stringify(ctx, null, 3));
    const prev_selected_option = (ctx.update as any)?.message?.text || ctx.callbackQuery?.data?.[0];
    const curTest = ctx.session.curTest;
    if (!curTest) {
      BotUtils.answerCBQuery(ctx);
      return;
    }
    BotUtils.answerCBQuery(ctx);
    const questionsCount = curTest.results.length;
    const question = ctx.session.questionsQueue.shift();

    if (question?.number <= questionsCount) {
      await ctx.replyWithPhoto({ source: `./uploads/${question.image}` }, {
        caption: `<strong>${question.number}-savol:</strong>`,
        parse_mode: "HTML",
        ...Markup.keyboard([
          [Markup.button.callback("A", "a_option_selected_action"),
            Markup.button.callback("B", "b_option_selected_action"),
            Markup.button.callback("C", "c_option_selected_action"),
            Markup.button.callback("D", "d_option_selected_action")
          ]
        ]).oneTime().resize()
      });
      if (ctx.callbackQuery?.message?.message_id) ctx.deleteMessage(ctx.callbackQuery.message.message_id);//del prev msg

      if (curTest.results[question.number - 2]?.question) {
        const prevQuestion = curTest.results[question.number - 2].question;
        await this.resultController.saveOptionToResultQuestion(curTest, prevQuestion, prev_selected_option);
      }
    } else {
      this.completeTest(ctx);
    }
  };


  public completeTest = async (ctx: MyContext) => {
    try {
      const prev_selected_option = (ctx.update as any)?.message?.text || ctx.callbackQuery.data[0];
      const curTest = ctx.session.curTest;
      const results = curTest.results;
      const count = curTest.results.length;

      if (results[count - 1]?.question) {
        const lastQuestion = results[count - 1].question;
        await this.resultController.saveOptionToResultQuestion(curTest, lastQuestion, prev_selected_option);
        const completedTest: TestWithStats = await this.testController.completeTest(curTest.id);

        ctx.session.curTest = completedTest;
        ctx.session.questionsQueue = [];

        ctx.replyWithHTML(`<strong>Test Yakunlandi</strong>

<em>Javoblar</em>: <strong>${Math.round(completedTest.stats.corrects)} / ${count}</strong>
<em>Foizda</em>: <strong>${Math.round(completedTest.stats.percentage)}%</strong>
<em>Tugatilgan vaqt:</em> ${moment(completedTest.completedAt).format("DD.MM.YYYY, hh:mm:ss")}
<em>Test raqami:</em> ${curTest.id}`, {
          // ...Markup.inlineKeyboard([
          //   Markup.button.callback("Javobini ko'rish", "open_results")
          // ]),
          ...Markup.keyboard([
            [Markup.button.callback("Javobni ko'rish", "open_results"),
              Markup.button.callback("Yangi Test", "start_test_action")]
          ]).oneTime().resize(true)
        });
        if (ctx.callbackQuery?.message?.message_id) ctx.deleteMessage(ctx.callbackQuery.message.message_id);
      }
    } catch (e) {
      console.log("complete Test---", e);
    }
  };


}
