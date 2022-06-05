import { Markup } from "telegraf";


export default function initListeners (bot){
  bot.start(async (ctx) => {
      try {
        if (!ctx.message.from.is_bot) {
          ctx.reply("Welcome, you need to register first ", Markup.inlineKeyboard([
              Markup.button.callback("Register to continue", "register_action")
            ])
          );
        } else {
          ctx.reply("Afsuski botlar uchun kirish huquqi yo'q");
        }
      } catch (e) {
        console.error("start bot -", e);
      }
    }
  );




  bot.help((ctx) => ctx.reply("Send me a sticker"));
  bot.on("sticker", (ctx) => ctx.reply("👍"));
  bot.hears("hi", (ctx) => {
    ctx.reply("Hey there");
  });
  bot.launch().catch(e => console.error("bot---", e));

}
