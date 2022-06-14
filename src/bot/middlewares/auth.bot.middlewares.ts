import { CreateUserDto } from "@dtos/users.dto";
import { User } from "@interfaces/users.interface";
import { Markup } from "telegraf";
import BotAuthController from "@/bot/controller/botAuth.controller";
import { MyContext } from "@/bot/bot.interfaces";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import BotUtils from "@/bot/utils/BotUtils";
import usersController from "@/bot/controller/users.controller";
import usersService from "@services/users.service";

export default class AuthBotMiddlewares {
  public authController = new BotAuthController();
  public userController = new usersController();
  public userService = new usersService();

  public welcome = async (ctx: MyContext) => {
    try {
      if (ctx.from.is_bot) {
        await ctx.reply("Afsuski botlar uchun kirish huquqi yo'q");
        return;
      }
      try {
        let user = ctx.session.currentUser;
        if (!user?.id) {
          user = await this.userController.getUserByTgId(ctx.from.id);
        }
        if (user?.id) {
          const balance = await this.userService.getUserBalance( user.id);

          const replyContent = this.welcomeCtx(user, balance);
          await ctx.replyWithHTML(replyContent.message, replyContent.extra);
        } else {
          throw new Error("User not found");
        }
      } catch (e) {
        if (ctx.callbackQuery?.message?.message_id) ctx.deleteMessage(ctx.callbackQuery.message.message_id);
        await ctx.reply("Prezident va al-Xorazmiy maktablarining kirish imtihonlariga tayyorgarlik testlari botiga hush kelibsiz!", Markup.keyboard([
            Markup.button.callback("Royxatdan otish", "register_action")
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
    const balance = await this.userService.getUserBalance(createUserData.id);
    const replyContent = this.welcomeCtx(createUserData, balance, true);
    ctx.replyWithHTML(replyContent.message, replyContent.extra);
    BotUtils.answerCBQuery(ctx);
  };

  private welcomeCtx(createUserData: User, balance: number, isNewUser = false): { message: string, extra: ExtraReplyMessage } {
    return {
      message: `${getUserDisplayName(createUserData)}. ${isNewUser ? "Siz ro’yhatdan o’tdingiz." : ""} \n
Sizning ID raqamingiz: <code>${createUserData.account_number}</code>\n
Sizning balans: ${balance} so’m\n
<strong>Eslatma!</strong>
30 ta savoldan iborat 1 ta
testni yechish narxi 20000 so’m`,
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
