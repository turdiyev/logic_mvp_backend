import { CreateUserDto } from "@dtos/users.dto";
import { User } from "@interfaces/users.interface";
import { Markup } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import UsersService from "@services/users.service";
import { toPriceFormat } from "@utils/paymentUtils";
import AuthService from "@services/auth.service";

export default class AuthBotMiddlewares {
  public authService = new AuthService();
  public userService = new UsersService();

  public welcome = async (ctx: MyContext) => {
    try {
      if (ctx.from.is_bot) {
        await ctx.reply("Afsuski botlar uchun kirish huquqi yo'q");
        return;
      }
      try {
          const user = await this.userService.findUserByTgId(ctx.from.id);
          ctx.session.curUserId = user.id;
        if (user?.id) {
          const balance = await this.userService.getUserBalanceInSOM(ctx.from.id);

          const replyContent = this.welcomeCtx(user, balance);
          await ctx.replyWithHTML(replyContent.message, replyContent.extra);
        } else {
          throw new Error("User not found");
        }
      } catch (e) {
        await ctx.reply("Prezident va al-Xorazmiy maktablarining kirish imtihonlariga tayyorgarlik testlari botiga hush kelibsiz!", Markup.keyboard([
            Markup.button.callback("Ro`yxatdan o`tish", "register_action")
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
    const createUserData: User = await this.authService.signUpOrIn(userData);
    ctx.session.curUserId = createUserData.id;

    const balance = await this.userService.getUserBalanceInSOM(ctx.from.id);

    const replyContent = this.welcomeCtx(createUserData, balance, true);

    ctx.replyWithHTML(replyContent.message, replyContent.extra);
  };

  private welcomeCtx(createUserData: User, balance: number, isNewUser = false): { message: string, extra: ExtraReplyMessage } {
    return {
      message: `${getUserDisplayName(createUserData)}. ${isNewUser ? "Siz ro’yhatdan o’tdingiz." : ""} \n
Sizning ID raqamingiz: <code>${createUserData.account_number}</code>\n
Sizning balans: ${toPriceFormat(balance)} so’m\n
<strong>Eslatma!</strong>
30 ta savoldan iborat 1 ta test variantini yechish narxi 20 000 so’m`,
      extra:
        Markup.keyboard([[
          Markup.button.callback("Testni boshlash", "start_test_action"),
          Markup.button.callback("Yechilgan teshlar", "my_results")
        ]]).oneTime().resize()
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
