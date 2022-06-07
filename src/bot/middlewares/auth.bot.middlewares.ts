import { CreateUserDto } from "@dtos/users.dto";
import { User } from "@interfaces/users.interface";
import { Markup } from "telegraf";
import BotAuthController from "@/bot/controller/botAuth.controller";
import { MyContext } from "@/bot/bot.interfaces";

export default class AuthBotMiddlewares {
  public authController = new BotAuthController();

  public welcome = async (ctx: MyContext) => {
    try {
      if (ctx.from.is_bot) {
        await ctx.reply("Afsuski botlar uchun kirish huquqi yo'q");
        return;
      }

      const sessionUser: User = ctx.session?.currentUser;

      if (sessionUser?.id) {
        await ctx.reply(`Welcome, ${getUserDisplayName(sessionUser)}`, Markup.inlineKeyboard([
            Markup.button.callback("Start", "start_test_action")
          ])
        );
      } else {
        await ctx.reply("Welcome, you need to register first ", Markup.inlineKeyboard([
            Markup.button.callback("Register to continue", "register_action")
          ])
        );
      }
    } catch (e) {
      console.error("start bot -", e);
    }
  };

  public register = async (ctx: MyContext, next) => {
    // console.log("register -- ", ctx.from);
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

    ctx.reply(`${createUserData.first_name || createUserData.username}. You are registered \n
Your id is: 123132132\n
Your balanse is: 20 000 so’m`, Markup.inlineKeyboard([
      Markup.button.callback("Start Test", "start_test_action")
    ]));
    ctx.answerCbQuery();
  };

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
