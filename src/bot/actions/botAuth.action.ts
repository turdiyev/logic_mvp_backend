import { CreateUserDto } from "@dtos/users.dto";
import { User } from "@interfaces/users.interface";
import { Markup } from "telegraf";
import BotAuthController from "@/bot/controller/botAuth.controller";

export default class BotAuthAction {
  private authController = new BotAuthController();

  async register(ctx: any, next) {
    const from = ctx.update.callback_query.from;
    console.log("register action -- ", from, JSON.stringify(ctx));
    const userData: CreateUserDto = {
      telegram_user_id: from.id,
      username: from.username || String(ctx.message.from.id),
      first_name: from.first_name || "",
      last_name: from.last_name || "",
      json_data: JSON.stringify(from),
      password: "Test_2@22"
    };
    const createUserData: User = await this.authController.signInOrUp(userData);

    return ctx.reply(`${createUserData.first_name || createUserData.username}. You are registered \n
Your id is: 123132132\n
Your balanse is: 20 000 so’m`, Markup.inlineKeyboard([
      Markup.button.callback("Start Test", "start_test_action")
    ]))
      .then(() => next());
  }

}
