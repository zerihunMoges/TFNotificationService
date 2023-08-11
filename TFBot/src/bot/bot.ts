import axios from "axios";
import { Telegraf, Markup } from "telegraf";
import {
  InlineKeyboardButton,
  InlineQueryResult,
  InputTextMessageContent,
} from "telegraf/types";
import { Context, session } from "telegraf";
import { getLeagues } from "./data";
import { addChannel } from "../resources/channel/channel.functions";
import { config } from "../config";
import LocalSession from "telegraf-session-local";

interface SessionData {
  waitingForChannel?: boolean;
}

interface MyContext extends Context {
  session: SessionData;
}

const token = config.botToken;
export const bot = new Telegraf<MyContext>(token);
const localSession = new LocalSession({ database: "session_db.json" });

bot.use(localSession.middleware());

bot.telegram.setMyCommands([
  { command: "addchannel", description: "Add a channel" },
]);

bot.catch((err, ctx) => {
  console.error(`Error while handling update ${ctx.update.update_id}:`, err);
});

bot.start((ctx) => ctx.reply("Welcome"));

bot.command("addchannel", async (ctx) => {
  ctx.session.waitingForChannel = true;

  await ctx.reply(
    "To add your channel, please follow these steps\n\n 1. Add me as an admin to your channel and grant me post rights.\n\n2. Send me your channel’s username or forward a post from your channel to me for verification.\n\nThis will allow me to verify that I have the necessary permissions to post on your channel. Thank you! 😊"
  );
});

bot.on("message", async (ctx) => {
  if (ctx.session.waitingForChannel) {
    const msg = ctx.message;
    let channelUsername: string | number;
    if ("forward_from_chat" in msg) {
      channelUsername = msg.forward_from_chat.id;
      if (!channelUsername) {
        await ctx.reply("Sorry, I couldn’t get the chat ID. Please try again!");
        return;
      }
    } else if ("text" in msg) {
      channelUsername = msg.text;

      const usernameRegex = /(?:https?:\/\/)?(?:t\.me\/)?@?(\w+)/;
      const match = channelUsername.match(usernameRegex);
      if (match) {
        channelUsername = "@" + match[1];
      } else {
        await ctx.reply("Sorry, I couldn't understand the channel username");
        return;
      }
    } else return;

    try {
      const chat = await ctx.telegram.getChat(channelUsername);

      if (chat.type !== "channel") {
        await ctx.reply("Sorry, this is not a channel");
        return;
      }
      const member = await ctx.telegram.getChatMember(
        channelUsername,
        ctx.botInfo.id
      );
      if (member.status === "administrator" && member.can_post_messages) {
        const channel = await addChannel({
          chatId: chat.id,
          title: chat.title,
          username: chat.username,
          userChatId: ctx.chat.id,
        });

        await ctx.reply(
          "Channel added successfully, you can now add notifcation subscription to your channel"
        );
        ctx.session.waitingForChannel = false;
      } else {
        const verifyKeyboard = Markup.inlineKeyboard([
          { text: "Verify", callback_data: "verify_admin" },
          { text: "Cancel", callback_data: "canceladdchannelrequest" },
        ]);

        await ctx.reply(
          "Sorry, I am still not an admin. Please make sure you have granted me the right to post.",
          verifyKeyboard
        );
        bot.action("verify_admin", async (ctx) => {
          const member = await ctx.telegram.getChatMember(
            channelUsername,
            ctx.botInfo.id
          );
          if (member.status === "administrator" && member.can_post_messages) {
            const channel = await addChannel({
              chatId: chat.id,
              title: chat.title,
              username: chat.username,
              userChatId: ctx.chat.id,
            });
            await ctx.editMessageText(
              "Channel added successfully, you can now add notifcation subscription to your channel"
            );
            ctx.session.waitingForChannel = false;
            return;
          } else {
            await ctx.editMessageText(
              "Verification failed. Please make sure to give me the right to post.",
              verifyKeyboard
            );
          }
        });
        bot.action("canceladdchannelrequest", async (ctx) => {
          ctx.session.waitingForChannel = false;
          await ctx.editMessageText("Request to add a new channel cancelled!");
        });
      }
    } catch (error) {
      if (
        error.description === "Bad Request: chat not found" ||
        error.description ===
          "Forbidden: bot is not a member of the channel chat"
      ) {
        await ctx.reply(
          "ohh, seems like i am not in your channel, please add me to your channel as an admin with post right and try again!"
        );
      } else {
        await ctx.reply(
          "Sorry, Request failed for some reason, Please try again!"
        );
        console.error(error);
      }
    }
  }
});

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
