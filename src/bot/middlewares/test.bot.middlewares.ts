import { Markup } from "telegraf";
import { MyContext } from "@/bot/bot.interfaces";
import { Tests } from "@interfaces/test.interface";
import moment from "moment";
import testsService, { TestWithStats } from "@services/tests.service";
import BotUtils from "@/bot/utils/BotUtils";
import usersService from "@services/users.service";
import resultsService from "@services/results.service";
import { ONE_TEST_PRICE } from "@config";
import { toPriceFormat } from "@utils/paymentUtils";

export default class BotTestAction {
  public resultsService = new resultsService();
  public userService = new usersService();
  public testService = new testsService();

  public startTest = async (ctx: MyContext, next) => {
    try {
      const balance = await this.userService.getUserBalanceInSOM(ctx.from.id);

      if (balance >= ONE_TEST_PRICE) {
        const test = await this.testService.generateTest(ctx.from.id, 30);

        ctx.session.curTest = test as Tests;
        ctx.session.questionsQueue = test.results.map(r => r.question);
        this.nextQuestion(ctx, next);
      } else {
        const user = await this.userService.findUserByTgId(ctx.from.id);
        ctx.replyWithHTML(`<strong>Hisobingizda yetarlicha mablag’ majvud emas.</strong>

Hisob raqamingiz: <code>${user.account_number}</code>

Balansingiz: ${toPriceFormat(balance)} so’m

Eslatma:
<em>1 ta test (30 savol) - 20 000 so’m</em>
<a href="https://telegra.ph/Hisobni-toldirish-06-15">Hisobni qanday to'ldirish mumkin?</a>
`, {
          disable_web_page_preview: true,

          ...Markup.keyboard([
            [
              Markup.button.callback("Testni boshlash", "start_test_action"),
              Markup.button.callback("Nimaga pulli?", "why_paid"),
              Markup.button.callback("Bosh sahifaga qaytish", "go_home")
            ]
          ]).oneTime().resize(true)
        });
      }

    } catch (e) {
      console.log("Bot TestAction: startTest---", e);
      ctx.replyWithHTML("👍 Tabriklaymiz. Siz hozirda bor test savollarini ishlab chiqdingiz.", {
        ...Markup.keyboard([
          [
            Markup.button.callback("Bosh sahifaga qaytish", "go_home")]
        ]).oneTime().resize(true)
      });
      BotUtils.answerCBQuery(ctx, "👍 Tabriklaymiz. Siz hozirda bor test savollarini ishlab chiqdingiz.");
    }
  };


  public nextQuestion = async (ctx: MyContext, next: any) => {
    const prev_selected_option = (ctx.update as any)?.message?.text || ctx.callbackQuery?.data?.[0];
    const curTest = ctx.session.curTest;
    if (!curTest) {
      // BotUtils.answerCBQuery(ctx);
      return;
    }
    // BotUtils.answerCBQuery(ctx);
    const questionsCount = curTest.results.length;
    const question = ctx.session.questionsQueue.shift();

    if (question?.number <= questionsCount) {
      ctx.replyWithPhoto({ source: `./uploads/${question.image}` }, {
        caption: `<strong>${question.number}-savol</strong> ${question.public_code ? `<code>(${question.public_code})</code>` : ""}`,
        parse_mode: "HTML",
        ...Markup.keyboard([
          [Markup.button.callback("A", "a_option_selected_action"),
            Markup.button.callback("B", "b_option_selected_action"),
            Markup.button.callback("C", "c_option_selected_action"),
            Markup.button.callback("D", "d_option_selected_action")
          ]
        ]).oneTime().resize()
      });
      // if (ctx.callbackQuery?.message?.message_id) ctx.deleteMessage(ctx.callbackQuery.message.message_id);//del prev msg

      if (curTest.results[question.number - 2]?.question) {
        const prevQuestion = curTest.results[question.number - 2].question;
        this.resultsService.saveByQuestion(curTest.id, prevQuestion.id, prev_selected_option.toLowerCase());

      }
    } else {
      this.completeTest(ctx);
    }
  };


  public completeTest = async (ctx: MyContext) => {
    try {
      const prev_selected_option = (ctx.update as any)?.message?.text || ctx.callbackQuery.data[0];
      const curTest = ctx.session.curTest;
      const results = curTest.results;
      const count = curTest.results.length;

      if (results[count - 1]?.question) {
        const lastQuestion = results[count - 1].question;
        await this.resultsService.saveByQuestion(curTest.id, lastQuestion.id, prev_selected_option.toLowerCase());
        const completedTest: TestWithStats = await this.testService.completeTest(curTest.id);

        ctx.session.curTest = completedTest;
        ctx.session.questionsQueue = [];

        ctx.replyWithHTML(`<strong>Test Yakunlandi</strong>

Siz ${count} ta savoldan ${Math.round(completedTest.stats.corrects)} tasiga to'g'ri javob berdingiz.

<em>Foizda</em>: <strong>${Math.round(completedTest.stats.percentage)}%</strong>
<em>Tugatilgan vaqt:</em> ${moment(completedTest.completed_at).format("DD.MM.YYYY, hh:mm:ss")}

To'g'ri javoblarni ko'rish uchun qiyidagi "Javoblarni ko'rish" tugmasini bosing.`, {


          // ...Markup.inlineKeyboard([
          //   Markup.button.callback("Javobini ko'rish", "open_results")
          // ]),
          ...Markup.keyboard([
            [Markup.button.callback("Javoblarni ko'rish", "open_results"),
              Markup.button.callback("Bosh sahifaga qaytish", "go_home")]
          ]).oneTime().resize(true)
        });
        if (ctx.callbackQuery?.message?.message_id) ctx.deleteMessage(ctx.callbackQuery.message.message_id);
      }
    } catch (e) {
      console.log("complete Test---", e);
    }
  };


  public postWhyPaid = async (ctx: MyContext) => {
    ctx.replyWithHTML(`<strong>Nimaga test pullik?</strong>

- Har bir savol-javobni qadrini, hayotga asqotishini bildirish uchun;

- 2kg shakarga talashmaydigan kelajakni qurish uchun;

- Ota-onalarni farzandi ta'limiga e'tiborini isbotlash uchun;

- Testlarni sifatli qilib interaktiv tayyorlash uchun;

- Har bir testga javobni maqola va video shaklida darslik qilish uchun;

- Dasturni bolalarga qulayroq qilib takomillashtirish uchun;
`, {
      disable_web_page_preview: true,

      ...Markup.keyboard([
        [Markup.button.callback("Testni boshlash", "start_test_action"),
          Markup.button.callback("Bosh sahifaga qaytish", "go_home")]
      ]).oneTime().resize(true)
    });
  };

}
