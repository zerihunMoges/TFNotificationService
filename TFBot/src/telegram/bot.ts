import { Telegraf, Markup, Scenes, Context, session } from "telegraf";
import { InlineKeyboardMarkup, InlineQueryResult } from "telegraf/types";
import { addChannel } from "../resources/channel/channel.functions";
import { config } from "../config";
import {
  extractQuery,
  handleClubsQuery,
  handleLeaguesQuery,
} from "./botinlinequery-handlers";
import { Channel } from "../resources/channel/channel.model";
import {
  Subscription,
  ISubscription,
} from "../resources/clubs/subscription.model";
import { getClub, getLeague, getLeagues } from "./botservice";
const LocalSession = require("telegraf-session-local");
interface SessionData {
  waitingForChannel?: boolean;
}

interface MyContext extends Context {
  session: SessionData;
}

const token = config.botToken;
export const bot = new Telegraf<Scenes.SceneContext>(token);

const localSession = new LocalSession({ database: "example_db.json" });

bot.use(localSession.middleware());
const stage = new Scenes.Stage<Scenes.SceneContext>();
bot.use(stage.middleware());
export const addChannelScene = new Scenes.BaseScene<any>("addchannel_scene");

stage.register(addChannelScene);

const pickSubscriptionMethodKeyboard = Markup.inlineKeyboard([
  [Markup.button.switchToCurrentChat("League", "#Leagues ", false)],
  [Markup.button.switchToCurrentChat("Club", "#Clubs England", false)],
  [
    {
      text: "Match",
      switch_inline_query_current_chat: `#Matches`,
    },
  ],
]);

bot.telegram.setMyCommands([
  { command: "addchannel", description: "Add a channel" },
]);

bot.catch((err, ctx) => {
  console.error(`Error while handling update ${ctx.update.update_id}:`, err);
  ctx.reply(
    "Oops! Something went wrong. Our team has been notified and we’re working hard to fix the issue. Please try again later or contact our support if the issue persists."
  );
});

bot.start((ctx) => {
  ctx.reply(
    "📣 Choose your preferred subscription option below, you can add multiple different subscription for channel \n\n 1. Follow a specific league ⚽\n\n 2. Follow a club 🏆 \n\n 3. Follow a specific match 🥅 \n\n Select one of the buttons to get started! 🎉",
    pickSubscriptionMethodKeyboard
  );
});

bot.action("addchannel", async (ctx) => {
  await bot.telegram.sendMessage(
    ctx.from.id,
    "Click here to add a channel: /addchannel"
  );
});

bot.on("chosen_inline_result", (ctx) => {
  const result = ctx.chosenInlineResult;
  console.log(result);
  // Do something with the result...
});

bot.action(/ans:(.+)/, async (ctx) => {
  let [chatId, eventType, id, type] = ctx.match[1].split(":");
  try {
    const subscription = await Subscription.findOne({
      chatId,
      subscriptionId: id,
      type: type,
    });

    if (eventType.toLowerCase() === "goal")
      subscription.goal = !subscription.goal;
    if (eventType.toLowerCase() === "yellowcard")
      subscription.yellowCard = !subscription.yellowCard;
    if (eventType.toLowerCase() === "redcard")
      subscription.redCard = !subscription.redCard;
    if (eventType.toLowerCase() === "lineups")
      subscription.lineups = !subscription.lineups;
    if (eventType.toLowerCase() === "substitution")
      subscription.substitution = !subscription.substitution;
    if (eventType.toLowerCase() === "var") subscription.var = !subscription.var;
    if (eventType.toLowerCase() === "activate")
      subscription.active = !subscription.active;
    console.log(subscription);
    let answerKeyboard: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text: `Goal   ${subscription.goal ? "➖" : "➕"}`,
            callback_data: `ans:${chatId}:goal:${id}:${type}`,
          },
          {
            text: `Yellow Card  ${subscription.yellowCard ? "➖" : "➕"}`,
            callback_data: `ans:${chatId}:yellowcard:${id}:${type}`,
          },
        ],
        [
          {
            text: `Red Card   ${subscription.redCard ? "➖" : "➕"}`,
            callback_data: `ans:${chatId}:redcard:${id}:${type}`,
          },
          {
            text: `Substitiution   ${subscription.substitution ? "➖" : "➕"}`,
            callback_data: `ans:${chatId}:substitution:${id}:${type}`,
          },
        ],
        [
          {
            text: `Var   ${subscription.var ? "➖" : "➕"}`,
            callback_data: `ans:${chatId}:var:${id}:${type}`,
          },
          {
            text: `Lineups   ${subscription.lineups ? "➖" : "➕"}`,
            callback_data: `ans:${chatId}:lineups:${id}:${type}`,
          },
        ],
        [
          {
            text: `${subscription.active ? "Unsubscribe" : "subscribe"}`,
            callback_data: `ans:${chatId}:activate:${id}:${type}`,
          },
        ],
      ],
    };

    await Subscription.findOneAndUpdate(
      { chatId, subscriptionId: id, type },
      subscription,
      { upsert: true }
    );
    await ctx.editMessageReplyMarkup(answerKeyboard);
  } catch (err) {
    console.error("error while editing subscriptioin", err);
  }
});

bot.action(/pch:(.+)/, async (ctx) => {
  const [chatId, type, id] = ctx.match[1].split(":");
  try {
    const chat = await ctx.telegram.getChat(chatId);
    let name: string;
    if (chat.type !== "channel") {
      return;
    }
    if (type.toLowerCase() === "league") {
      name = getLeague(id).league.name;
    }
    if (type.toLowerCase() == "club") {
      const club = await getClub(id);
      name = club.team.name;
    }
    let subscription: ISubscription;

    subscription = (await Subscription.findOne({
      chatId,
      subscriptionId: id,
      type: type.toLowerCase(),
    })) || {
      chatId,
      chatName: chat.title,
      subscriptionName: name,
      subscriptionId: id,
      type: type,
      goal: true,
    };

    let answerKeyboard: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text: `Goal   ${subscription.goal ? "➖" : "➕"}`,
            callback_data: `ans:${chatId}:goal:${id}:${type}`,
          },
          {
            text: `Yellow Card  ${subscription.yellowCard ? "➖" : "➕"}`,
            callback_data: `ans:${chatId}:yellowcard:${id}:${type}`,
          },
        ],
        [
          {
            text: `Red Card   ${subscription.redCard ? "➖" : "➕"}`,
            callback_data: `ans:${chatId}:redcard:${id}:${type}`,
          },
          {
            text: `Substitiution   ${subscription.substitution ? "➖" : "➕"}`,
            callback_data: `ans:${chatId}:substitution:${id}:${type}`,
          },
        ],
        [
          {
            text: `Var   ${subscription.var ? "➖" : "➕"}`,
            callback_data: `ans:${chatId}:var:${id}:${type}`,
          },
          {
            text: `Lineups   ${subscription.lineups ? "➖" : "➕"}`,
            callback_data: `ans:${chatId}:lineups:${id}:${type}`,
          },
        ],
        [
          {
            text: `${subscription.active ? "Unsubscribe" : "subscribe"}`,
            callback_data: `ans:${chatId}:activate:${id}:${type}`,
          },
        ],
      ],
    };

    const result = await Subscription.findOneAndUpdate(
      { chatId, subscriptionId: id, type: type.toLowerCase() },
      subscription,
      { upsert: true }
    );

    await ctx.editMessageText(
      `📢 ${subscription.chatName} \n\n🔔 Select the live football events of <b>${name}</b> matches you want to receive`,
      {
        parse_mode: "HTML",
        reply_markup: answerKeyboard,
      }
    );
  } catch (err) {
    console.error("error while editing subscriptioin", err);
  }
});

bot.command("addchannel", async (ctx) => {
  await ctx.scene.enter("addchannel_scene");
  await ctx.reply(
    "To add your channel, please follow these steps\n\n 1. Add me as an admin to your channel and grant me post rights.\n\n2. Send me your channel’s username or forward a post from your channel to me for verification.\n\nThis will allow me to verify that I have the necessary permissions to post on your channel. Thank you! 😊"
  );
});

addChannelScene.on("message", async (ctx) => {
  const msg = ctx.message;
  let channelUsername: string | number;
  if ("forward_from_chat" in msg) {
    channelUsername = msg.forward_from_chat.id;
    if (!channelUsername) {
      await ctx.reply("Sorry, I couldn’t get the chat ID. Please try again!");
    }
  } else if ("text" in msg) {
    channelUsername = msg.text;

    const usernameRegex = /(?:https?:\/\/)?(?:t\.me\/)?@?(\w+)/;
    const match = channelUsername.match(usernameRegex);
    if (match) {
      channelUsername = "@" + match[1];
    } else {
      await ctx.reply("Sorry, I couldn't understand the channel username");
    }
  } else return;
  try {
    const chat = await ctx.telegram.getChat(channelUsername);

    if (chat.type !== "channel") {
      await ctx.reply("Sorry, this is not a channel");
      return;
    }
    const me = await ctx.telegram.getChatMember(
      channelUsername,
      ctx.botInfo.id
    );

    const user = await ctx.telegram.getChatMember(channelUsername, ctx.from.id);
    if (
      me.status === "administrator" &&
      me.can_post_messages &&
      (user.status === "administrator" || user.status === "creator")
    ) {
      const channel = await addChannel({
        chatId: chat.id,
        title: chat.title,
        username: chat.username,
        userChatId: ctx.chat.id,
      });

      await ctx.reply(
        "Channel added successfully, you can now add notifcation subscription to your channel"
      );
      return;
    } else {
      if (user.status !== "administrator" && user.status !== "creator")
        return await ctx.reply(
          `Sorry, you are not an administrator in ${chat.title}`
        );
      if (me.status !== "administrator" || me.can_post_messages)
        return await ctx.reply(
          "Sorry, I don’t have the necessary privileges to post on your channel. Please make sure to grant me the right to post and try again. Thank you!"
        );
    }
  } catch (error) {
    if (
      error.description === "Bad Request: chat not found" ||
      error.description === "Forbidden: bot is not a member of the channel chat"
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
  } finally {
    return await ctx.scene.leave();
  }
});

bot.on("inline_query", async (ctx) => {
  try {
    const offset = ctx.inlineQuery.offset
      ? parseInt(ctx.inlineQuery.offset)
      : 0;
    const limit = 10;
    const query = ctx.inlineQuery.query;

    const { type, country, actualQuery } = extractQuery(query);
    let header: InlineQueryResult = {
      type: "article",
      id: "header",
      title: "",
      input_message_content: {
        message_text: "/start",
      },
    };
    let results: InlineQueryResult[] = [];

    const userChannels =
      (await Channel.find({ userChatIds: { $in: [ctx.from.id] } })) || [];

    if (type === "#Leagues") {
      header.title = `Leagues: keyword-${actualQuery}`;
      results = await handleLeaguesQuery(
        limit,
        offset,
        actualQuery,

        userChannels
      );
    }
    if (type === "#Clubs") {
      header.title = `Clubs: country-${
        country && country.trim().length > 0 ? country : `Country is Required`
      }`;

      results = await handleClubsQuery(
        country,
        limit,
        offset,
        actualQuery,

        userChannels
      );
    }

    const emptyChar = "‎";

    return await ctx.answerInlineQuery([header, ...results], {
      next_offset: (offset + limit).toString(),
      cache_time: 0,
    });
  } catch (err) {
    console.error("error occured while handling inline query", err);
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
