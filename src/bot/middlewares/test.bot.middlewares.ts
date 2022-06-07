import { Markup } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import TestController from "@/bot/controller/test.controller";
import { Tests } from "@interfaces/test.interface";
import { Questions } from "@interfaces/questions.interface";
import * as fs from "fs";

export default class BotTestAction {
  public testController = new TestController();

  public startTest = async (ctx: MyContext, next) => {
    await ctx.answerCbQuery();
    const test = await this.testController.generateTest(29);
    console.log("GENERATED Test--- ", test);
    ctx.session.curTest = test as Tests;
    ctx.session.curQuestion = test.questions[0] as Questions;

    ctx.replyWithPhoto({ url: "https://picsum.photos/200/300/?random" }, {
      caption: `*${ctx.session.curQuestion.number}\\-savol:* _\\(savol kode: *${ctx.session.curQuestion.name}*\\)_`,
      parse_mode: "MarkdownV2",
      ...Markup.inlineKeyboard([
        Markup.button.callback("A", "a_option_selected_action"),
        Markup.button.callback("B", "b_option_selected_action"),
        Markup.button.callback("C", "c_option_selected_action"),
        Markup.button.callback("D", "d_option_selected_action")
      ])
    });
  };


  public nextQuestion = async (ctx: MyContext, next) => {
    const selection_option = ctx.callbackQuery.data[0];
    await ctx.answerCbQuery();
    console.log("next question  -- ", ctx.callbackQuery.data);
    const prevQuestion = ctx.session.curQuestion;
    ctx.session.curQuestion = ctx.session.curTest.questions[prevQuestion.number];
    const question = ctx.session.curQuestion;

    ctx.replyWithPhoto({ source: `./uploads/${question.image}` }, {
      caption: `*${question.number}\\-savol:* _\\(savol kode: *${question.name}*\\)_ \\/n ${question.image}`,
      parse_mode: "MarkdownV2",
      ...Markup.inlineKeyboard([
        Markup.button.callback("A", "a_option_selected_action"),
        Markup.button.callback("B", "b_option_selected_action"),
        Markup.button.callback("C", "c_option_selected_action"),
        Markup.button.callback("D", "d_option_selected_action")
      ])
    });
  };


}