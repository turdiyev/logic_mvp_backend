import { CreateUserDto } from "@dtos/users.dto";
import { User } from "@interfaces/users.interface";
import { Markup } from "telegraf";
import BotAuthController from "@/bot/controller/botAuth.controller";
import { MyContext } from "@/bot/bot.interfaces";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import BotUtils from "@/bot/utils/BotUtils";
import usersController from "@/bot/controller/users.controller";

export default class AuthBotMiddlewares {
  public authController = new BotAuthController();
  public userController = new usersController();

  public welcome = async (ctx: MyContext) => {
    try {
      if (ctx.from.is_bot) {
        await ctx.reply("Afsuski botlar uchun kirish huquqi yo'q");
        return;
      }
      const user = await this.userController.getUserByTgId(ctx.from.id);

      if (user?.id) {
        const replyContent = this.welcomeCtx(user);
        await ctx.replyWithHTML(replyContent.message, replyContent.extra);

      } else {
        if (ctx.callbackQuery?.message?.message_id) ctx.deleteMessage(ctx.callbackQuery.message.message_id);
        await ctx.reply("Prezident va al-Xorazmiy maktablarining kirish imtihonlariga tayyorgarlik testlari botiga hush kelibsiz!", Markup.keyboard([
            Markup.button.callback("Ro'yxatdan o'tish", "register_action")
          ]).resize().oneTime()
        );
      }
    } catch (e) {
      console.error("start bot -", e);
    }
  };

  public register = async (ctx: MyContext, next) => {
    const from = ctx.from;
    const userData: CreateUserDto = {
      telegram_user_id: from.id,
      username: from.username || String(from.id),
      first_name: from.first_name || "",
      last_name: from.last_name || "",
      json_data: JSON.stringify(from),
      password: "Test_2@22"
    };
    const createUserData: User = await this.authController.signInOrUp(userData);
    ctx.session.currentUser = createUserData;
    const replyContent = this.welcomeCtx(createUserData, true);
    ctx.replyWithHTML(replyContent.message, replyContent.extra);
    BotUtils.answerCBQuery(ctx);
  };

  private welcomeCtx(createUserData: User, isNewUser = false): { message: string, extra: ExtraReplyMessage } {
    return {
      message: `${getUserDisplayName(createUserData)}. ${isNewUser ? "Siz ro’yhatdan o’tdingiz." : ""} \n
Sizning ID raqamingiz: ${createUserData.account_number}\n
Sizning balans: ${Number(createUserData.initial_balance || 0) / 100} so’m`,
      extra:
        Markup.keyboard([
          Markup.button.callback("Testni boshlash", "start_test_action")
        ]).oneTime().resize()
    };
  }
}

function getUserDisplayName(user: User) {
  if (user.first_name && user.last_name) {
    return user.first_name + " " + user.last_name;
  }
  if (user.first_name || user.last_name) {
    return user.first_name || user.last_name;
  }
  if (user.username) {
    return user.username;
  }
}
