import { Markup } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import TestController from "@/bot/controller/test.bot.controller";
import { Tests } from "@interfaces/test.interface";
import ResultsBotController from "@/bot/controller/results.bot.controller";

export default class BotTestAction {
  public testController = new TestController();
  public resultController = new ResultsBotController();

  public startTest = async (ctx: MyContext, next) => {
    // await ctx.answerCbQuery();
    try {
      const test = await this.testController.generateTest(ctx.session.currentUser, 1);
      ctx.answerCbQuery("Test boshlandi");
      ctx.session.curTest = test as Tests;
      ctx.session.questionsQueue = test.questions.slice();
      this.nextQuestion(ctx, next);


    } catch (e) {
      ctx.reply(e.message);
    }
  };


  public nextQuestion = async (ctx: MyContext, next: any) => {
    const prev_selected_option = ctx.callbackQuery.data[0];
    // await ctx.answerCbQuery('sdfa adsfa fadsfad fasd');
    const curTest = ctx.session.curTest;
    const questions = curTest.questions;
    const questionsCount = questions.length;
    const question = ctx.session.questionsQueue.shift();
    console.log("next question:  -- ", ctx.callbackQuery.data, question?.number);

    if (question?.number <= questionsCount) {
      if (questions[question.number - 2]) {
        const prevQuestion = questions[question.number - 2];
        await this.resultController.saveOptionToResultQuestion(curTest, prevQuestion, prev_selected_option);
      }
      await ctx.replyWithPhoto({ source: `./uploads/${question.image}` }, {
        caption: `*${question.number}\\-savol:* _(savol kode: *${curTest.name}*_ \\/n ${question.image}`,
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          Markup.button.callback("A", "a_option_selected_action"),
          Markup.button.callback("B", "b_option_selected_action"),
          Markup.button.callback("C", "c_option_selected_action"),
          Markup.button.callback("D", "d_option_selected_action")
        ])
      });
      ctx.deleteMessage(ctx.callbackQuery.message.message_id);//del prev msg
    } else {
      if (questions[questionsCount - 1]) {
        const lastQuestion = questions[questionsCount - 1];
        await this.resultController.saveOptionToResultQuestion(curTest, lastQuestion, prev_selected_option);
        const completedTest = await this.testController.completeTest(curTest.id);
        console.log("completedTest --", completedTest);
        // ctx.session.curQuestion = undefined;
        // ctx.replyWithMarkdownV2(`*Test Yakunlandi*\nTest kodi: *${curTest.id}*\nIshladi: ${ctx.session.currentUser.first_name}\n`);
      }

    }
  };


}
