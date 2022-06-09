import { Markup } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import TestController from "@/bot/controller/test.bot.controller";
import { Tests } from "@interfaces/test.interface";
import ResultsBotController from "@/bot/controller/results.bot.controller";
import { TestEntity } from "@entities/test.entity";
import moment from "moment";

interface TestWithStats extends Tests {
  stats?: { questionsCount: number; corrects: number; percentage: number };
};
export default class BotTestAction {
  public testController = new TestController();
  public resultController = new ResultsBotController();

  public startTest = async (ctx: MyContext, next) => {
    // await ctx.answerCbQuery();
    try {
      const test = await this.testController.generateTest(ctx.session.currentUser, 4);
      ctx.answerCbQuery("Test boshlandi");
      ctx.session.curTest = test as Tests;
      ctx.session.curTest.questions = test.results.map(r => r.question);
      ctx.session.questionsQueue = ctx.session.curTest.questions.slice();
      this.nextQuestion(ctx, next);


    } catch (e) {
      console.log("Bot TestAction: startTest---", e);
      ctx.reply(e.message);
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
    const questions = curTest.questions;
    const questionsCount = questions.length;
    const question = ctx.session.questionsQueue.shift();
    console.log("next question:  -- ", ctx.callbackQuery.data, question?.number, curTest);

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
      ctx.deleteMessage(ctx.callbackQuery.message.message_id);//del prev msg

      if (questions[question.number - 2]) {
        const prevQuestion = questions[question.number - 2];
        await this.resultController.saveOptionToResultQuestion(curTest, prevQuestion, prev_selected_option);
      }
    } else {
      if (questions[questionsCount - 1]) {
        const lastQuestion = questions[questionsCount - 1];
        await this.resultController.saveOptionToResultQuestion(curTest, lastQuestion, prev_selected_option);
        const completedTest: TestWithStats = await this.testController.completeTest(curTest.id);
        completedTest.stats = { questionsCount, corrects: 0, percentage: 0 };
        completedTest.results.forEach((result) => {
          if (result.selected_option === result.question.correct_answer) {
            completedTest.stats.corrects += 1;
          }
        });
        completedTest.stats.percentage = (completedTest.stats.corrects / questionsCount) * 100;
        ctx.session.curTest = null;
        ctx.session.questionsQueue = [];
        console.log("completed test -- ", completedTest);
        // ctx.session.curQuestion = undefined;
        ctx.replyWithHTML(
          `<strong>Test Yakunlandi</strong>
<strong>${questionsCount}</strong> ta savoldan <strong>${completedTest.stats.corrects}</strong> ta to'g'ri.

<em>Javoblar</em>: <strong>${Math.round(completedTest.stats.corrects)} / ${questionsCount}%</strong>
<em>Foizda</em>: <strong>${Math.round(completedTest.stats.percentage)}%</strong>
<em>Tugatilgan vaqt:</em> ${moment(curTest.completedAt).format('DD.MM.YYYY, hh:mm:ss')}
<em>Test raqami:</em> ${curTest.id}
<em>Ishladi:</em> ${ctx.session.currentUser.first_name}`);
        ctx.deleteMessage(ctx.callbackQuery.message.message_id);

      }

    }
  };


}
