// consumer.ts
import { connect, Connection, Channel } from "amqplib";
import { bot } from "../telegram/bot";
import { config } from "../config";
import { Event } from "../types/event.type";
import { Teams } from "../types/team.type";
import { Channel as TelegramChannel } from "../resources/channel/channel.model";
import { Notification } from "../resources/notifications/notification.model";
import { join } from "path";

export async function sendMessage(
  message: string,
  chat_id: string,
  type: string,
  updateId,
  action: "post" | "put"
) {
  try {
    let sentMessage;
    if (action === "post")
      sentMessage = await bot.telegram.sendMessage(chat_id, message, {
        parse_mode: "HTML",
      });
    else if (action === "put") {
      sentMessage = await Notification.findOne({
        type: type,
        eventId: updateId,
      });
      sentMessage = await bot.telegram.editMessageText(
        chat_id,
        sentMessage.messageId,
        null,
        message
      );
    }

    await Notification.findOneAndUpdate(
      {
        type: type,
        chatId: chat_id,
        eventId: updateId,
      },
      {
        type,
        chatId: chat_id,
        eventId: updateId,
        messageId: sentMessage.message_id,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    if (
      err.response &&
      err.response.parameters &&
      err.response.parameters.retry_after
    ) {
      console.log("retry", err.response.parameters.retry_after);
      await new Promise((resolve) =>
        setTimeout(resolve, err.response.parameters.retry_after)
      );

      await sendMessage(message, chat_id, type, updateId, action);
    }
  }
}
export async function receiveUpdates() {
  const queue = "updates";
  try {
    const connection: Connection = config.mqConnection;
    const channel: Channel = await connection.createChannel();

    await channel.assertQueue(queue);
    await channel.prefetch(1);
    await channel.consume(queue, async (msg) => {
      if (msg) {
        const { message, user } = JSON.parse(msg.content.toString());
        let type: string;
        let data;
        let action: "post" | "put";
        let teams: Teams;
        ({ teams, action, type, data } = message);

        const chat_id = user;
        const telegramChannel = await TelegramChannel.findOne({
          chatId: chat_id,
        });
        if (!telegramChannel) return;

        let update = type;

        if (type === "event") {
          data = data as Event;
          let eventFormattedMessage =
            telegramChannel.postFormats[data.detail?.toLowerCase()] ||
            telegramChannel.postFormats[data.type?.toLowerCase()];

          const values = {
            time: data?.time?.elapsed,
            extra: data?.time?.extra ? data?.time?.extra : "",
            team: data?.team?.name,
            hometeam: teams?.home?.name,
            homegoal: data?.goals?.home,
            awaygoal: data?.goals?.away,
            in: data?.player?.name ? data?.player?.name : "",
            out: data?.assist?.name ? data?.assist?.name : "",
            awayteam: teams?.away?.name,
            player: data?.player?.name ? data?.player?.name : "",
            assist: data?.assist?.name ? data?.assist?.name : "",
          };

          const update = eventFormattedMessage?.replace(
            /{([^{}]*)}/g,
            (a, b) => {
              const r = values[b];
              return r !== null && r !== undefined ? r : "";
            }
          );

          if (update && update.length > 0) {
            await sendMessage(update, chat_id, type, data?.id, action);
          }
        } else if (type === "lineup") {
          const [home, away] = data;

          const { team, formation, startXI, substitutes } = home;
          const {
            team: awayTeam,
            formation: awayFormation,
            startXI: awayStartXI,
            substitutes: awaySubs,
          } = away;

          const homeFormated =
            `${team?.name} StartXI: ${formation && formation}\n\n` +
            startXI.map((player) => player.player.name).join("; ");
          const awayFormated =
            `${awayTeam?.name} StartXI: ${awayFormation && awayFormation}\n\n` +
            awayStartXI.map((player) => player.player.name).join("; ");
          const message = `TeamNews 📋\n\n${homeFormated}\n\n${awayFormated}`;
          await sendMessage(message, chat_id, type, data?.id, action);
        }

        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error("error occurred", err);
  }
}
