import axios from "axios";
import { Telegraf, Markup } from "telegraf";
import {
  InlineKeyboardButton,
  InlineQueryResult,
  InputTextMessageContent,
} from "telegraf/types";
import { getLeagues } from "./data";

const token = "5939030613:AAHMCtOqapLbO1bhu4zx_FU7njjgapQGz84";
const link = "https://starlit-dusk-e7dca0.netlify.app/";
export const bot = new Telegraf(token);

bot.catch((err, ctx) => {
  console.error(`Error while handling update ${ctx.update.update_id}:`, err);
});

bot.start((ctx) =>
  ctx.reply("Welcome", {
    reply_markup: { keyboard: [[{ text: "Pl Live", web_app: { url: link } }]] },
  })
);

bot.on("inline_query", async (ctx) => {
  try {
    const responseData = await getLeagues();

    const offset = ctx.inlineQuery.offset
      ? parseInt(ctx.inlineQuery.offset)
      : 0;
    const limit = 10;
    const queries = ctx.inlineQuery.query.split(" ");
    const results = responseData
      .filter(
        (data) =>
          queries.some((query) =>
            data.league.name.toLowerCase().includes(query.toLowerCase())
          ) ||
          queries.some((query) =>
            data.country.name.toLowerCase().includes(query.toLowerCase())
          )
      )
      .slice(offset, offset + limit);

    console.log(ctx.inlineQuery);
    const buttons: [string, string | undefined, string | undefined][] = [
      ["Choice 1", "choice_1", undefined],
      ["Choice 2", "choice_2", undefined],
      ["Choice 3", "choice_3", undefined],
      ["Choice 4", "choice_4", undefined],
      ["Choice 5", "choice_5", undefined],
      ["Submit Choices", "submit_choices", undefined],
      ["Search League", undefined, "league"],
    ];
    const emptyChar = "‎";
    const leagues: InlineQueryResult[] = results.map(
      ({ league, country, seasons }: any): InlineQueryResult => ({
        type: "article",
        id: league.id,
        title: league.name,
        description: country.name,
        thumb_url: league.logo,

        input_message_content: {
          message_text: `${league.name} <a href="${league.logo}">${emptyChar}</a>`,
          parse_mode: "HTML",
        },
      })
    );

    return await ctx.answerInlineQuery(leagues, {
      next_offset: (offset + limit).toString(),
      cache_time: 0,
    });
  } catch (err) {
    console.error("error occured while handling inline query", err);
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
