import { Markup } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import TestController from "@/bot/controller/test.controller";
import { Tests } from "@interfaces/test.interface";
import { Questions } from "@interfaces/questions.interface";
import * as fs from "fs";

export default class BotTestAction {
  public testController = new TestController();

  public startTest = async (ctx: MyContext, next) => {
    // await ctx.answerCbQuery();
    try {
      const test = await this.testController.generateTest(ctx.session.currentUser, 30);
      ctx.answerCbQuery("Test boshlandi");
      ctx.session.curTest = test as Tests;
      ctx.session.curQuestion = test.questions[0];
      this.nextQuestion(ctx, next);


    } catch (e) {
      ctx.reply(e.message);
    }
  };


  public nextQuestion = async (ctx: MyContext, next: any) => {
    const selection_option = ctx.callbackQuery.data[0];
    // await ctx.answerCbQuery('sdfa adsfa fadsfad fasd');
    console.log("next question  -- ", ctx.callbackQuery.data);
    const curTest = ctx.session.curTest;
    const questions = curTest.questions;
    const question = ctx.session.curQuestion;

    if (question?.number + 1 <= questions.length) {
      const prevMsgId = ctx.callbackQuery.message.message_id;

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
      ctx.deleteMessage(prevMsgId);

      //next question
      ctx.session.curQuestion = questions[question?.number];
    } else {
      ctx.session.curQuestion = undefined;
      ctx.replyWithMarkdownV2(`*Test Yakunlandi*\nTest kodi: *${curTest.id}*\nIshladi: ${ctx.session.currentUser.first_name}\n`);
    }
  };


}
