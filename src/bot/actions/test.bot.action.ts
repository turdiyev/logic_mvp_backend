import { Markup } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";

export default class BotTestAction {

  async startTest(ctx: MyContext, next) {
    return ctx.replyWithPhoto({ url: "https://picsum.photos/200/300/?random" }, {
      caption: `*1\\-savol:* _\\(savol kode: *XDF345*\\)_`,
      parse_mode: 'MarkdownV2',
      ...Markup.inlineKeyboard([
        Markup.button.callback("A", "a_start_test_action"),
        Markup.button.callback("B", "b_variant_action"),
        Markup.button.callback("C", "c_variant_action"),
        Markup.button.callback("D", "d_variant_action")
      ])
    }).then(() => next());

  }

}