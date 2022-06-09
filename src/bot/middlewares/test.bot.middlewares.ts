import { Markup } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import TestController from "@/bot/controller/test.bot.controller";
import { Tests } from "@interfaces/test.interface";
import ResultsBotController from "@/bot/controller/results.bot.controller";
import moment from "moment";
import { TestWithStats } from "@services/tests.service";

export default class BotTestAction {
  public testController = new TestController();
  public resultController = new ResultsBotController();

  public startTest = async (ctx: MyContext, next) => {
    // await ctx.answerCbQuery();
    try {
      const test = await this.testController.generateTest(ctx.session.currentUser, 3);
      ctx.answerCbQuery("Test boshlandi");
      ctx.session.curTest = test as Tests;
      ctx.session.questionsQueue = test.results.map(r => r.question);
      this.nextQuestion(ctx, next);


    } catch (e) {
      console.log("Bot TestAction: startTest---", e);
      ctx.answerCbQuery("👍 Tabriklaymiz. Siz hozirda bor test savollarini ishlab chiqdingiz.");
    }
  };


  public nextQuestion = async (ctx: MyContext, next: any) => {
    const prev_selected_option = ctx.callbackQuery.data[0];
    // await ctx.answerCbQuery('sdfa adsfa fadsfad fasd');
    const curTest = ctx.session.curTest;
    if (!curTest) {
      ctx.answerCbQuery();
      return;
    }
    ctx.answerCbQuery();
    const questionsCount = curTest.results.length;
    const question = ctx.session.questionsQueue.shift();

    if (question?.number <= questionsCount) {
      await ctx.replyWithPhoto({ source: `./uploads/${question.image}` }, {
        caption: `<strong>${question.number}-savol:</strong>`,
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          Markup.button.callback("A", "a_option_selected_action"),
          Markup.button.callback("B", "b_option_selected_action"),
          Markup.button.callback("C", "c_option_selected_action"),
          Markup.button.callback("D", "d_option_selected_action")
        ])
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
      const prev_selected_option = ctx.callbackQuery.data[0];
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
<em>Test raqami:</em> ${curTest.id}
<em>Ishladi:</em> ${completedTest.user?.first_name}`, {
          // ...Markup.inlineKeyboard([
          //   Markup.button.callback("Javobini ko'rish", "open_results")
          // ]),
          ...Markup.keyboard([
            "Javobni ko'rish",
            "Yangi Test",
          ]).oneTime()
        });
        if (ctx.callbackQuery?.message?.message_id) ctx.deleteMessage(ctx.callbackQuery.message.message_id);
      }
    } catch (e) {
      console.log("complete Test---", e);
    }
  };


}
