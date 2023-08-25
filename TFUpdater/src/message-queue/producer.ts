import { connect, Connection, Channel } from "amqplib";
import { Notification } from "../response-types/subscription.type";
import { channelPool } from "./channelPool";

async function sendMessage(channel: Channel, user: Notification, message) {
  try {
    console.log("sending message");
    const routingKey = user.targetType;
    const userMessage = { message, user };
    channel.publish(
      "updates",
      routingKey,
      Buffer.from(JSON.stringify(userMessage)),
      {
        expiration: 3 * 60000,
      }
    );
  } catch (err) {
    console.error(
      "error occurred sending message to user or channel: ",
      user.user,
      user.channel,
      err
    );
  }
}
export async function sendMessages(message: any, users: Notification[]) {
  let channel: Channel;
  try {
    channel = await channelPool.acquire();

    for (const user of users) {
      sendMessage(channel, user, message);
    }
  } catch (err) {
    console.error("error occured while sending messages", err);
  } finally {
    if (channel) channelPool.release(channel);
  }
}
