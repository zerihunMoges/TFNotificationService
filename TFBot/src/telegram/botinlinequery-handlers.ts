import { InlineKeyboardMarkup, InlineQueryResult } from "telegraf/types";
import { getClubs, getLeagues } from "./botservice";
import { Markup } from "telegraf";
import { off } from "process";

export async function handleClubsQuery(
  country: string,
  limit: number,
  offset: number,
  actualQuery: string,
  userChannels
): Promise<InlineQueryResult[]> {
  if (!country || country.trim().length == 0) {
    return [];
  }
  const emptyChar = "‎";

  const responseData = await getClubs(country);
  const response = responseData
    .filter(
      (data) =>
        data.team.name.toLowerCase().includes(actualQuery.toLowerCase()) ||
        data.team.country.toLowerCase().includes(actualQuery.toLowerCase())
    )
    .slice(offset, offset + limit);
  let answerKeyboard: InlineKeyboardMarkup = {
    inline_keyboard: [],
  };
  return response?.map(({ team, venue }: any): InlineQueryResult => {
    userChannels.forEach((channel) => {
      answerKeyboard.inline_keyboard.push([
        {
          text: `${channel.title} ${channel.username}`,
          callback_data: `pch:${channel.chatId}:club:${team.id}`,
        },
      ]);
    });
    answerKeyboard.inline_keyboard.push([
      { text: "➕ Add Channel", callback_data: "addchannel" },
    ]);
    return {
      type: "article",
      id: team.id,
      title: team.name,
      description: team.national ? `${team.name} National Team` : team.founded,
      thumb_url: team.logo,

      input_message_content: {
        message_text: `${team.name} <a href="${team.logo}">${emptyChar}</a>`,
        parse_mode: "HTML",
      },
      reply_markup: answerKeyboard,
    };
  });
}

export async function handleLeaguesQuery(
  limit: number,
  offset: number,
  actualQuery: string,

  userChannels
) {
  const emptyChar = "‎";
  const responseData = getLeagues();
  const response = responseData
    .filter(
      (data) =>
        data.league.name.toLowerCase().includes(actualQuery.toLowerCase()) ||
        data.country.name.toLowerCase().includes(actualQuery.toLowerCase())
    )
    .slice(offset, offset + limit);

  return response?.map(
    ({ league, country, seasons }: any): InlineQueryResult => {
      let answerKeyboard: InlineKeyboardMarkup = {
        inline_keyboard: [],
      };
      userChannels.forEach((channel) => {
        answerKeyboard.inline_keyboard.push([
          {
            text: `${channel.title} ${channel.username}`,
            callback_data: `pch:${channel.chatId}:league:${league.id}`,
          },
        ]);
      });
      answerKeyboard.inline_keyboard.push([
        { text: "➕ Add Channel", callback_data: "addchannel" },
      ]);
      return {
        type: "article",
        id: league.id,
        title: league.name,
        description: country.name,
        thumb_url: league.logo,

        input_message_content: {
          message_text: `${league.name} <a href="${league.logo}">${emptyChar}</a>`,

          parse_mode: "HTML",
        },
        reply_markup: answerKeyboard,
      };
    }
  );
}

export function extractQuery(query: string) {
  let type = "";
  let country = "";
  let actualQuery = "";

  console.log(query, query.toLowerCase(), query.split(" "));
  if (query.toLowerCase().startsWith("#leagues")) {
    const [tag, ...rest] = query.split(" ");
    type = tag;
    actualQuery = rest.join(" ");
  } else if (query.toLowerCase().startsWith("#clubs")) {
    let [tag, countrytemp, ...rest] = query.split(" ");
    type = tag;
    country = countrytemp;
    actualQuery = rest.join(" ");
  } else {
    console.log("unidentified");
    type = "#Leagues";
    actualQuery = query;
  }

  return { type, country, actualQuery };
}
