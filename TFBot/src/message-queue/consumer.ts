// consumer.ts
import { connect, Connection, Channel } from "amqplib";
import { bot } from "../bot/bot";
import { config } from "../config";

export async function receiveUpdates() {
  const queue = "updates";
  try {
    const connection: Connection = await connect(config.MQUrl);

    const channel: Channel = await connection.createChannel();

    await channel.assertQueue(queue);

    channel.consume(queue, async (msg) => {
      if (msg) {
        const { message, user } = JSON.parse(msg.content.toString());
        console.log(`Received item ${message} for user ${user}`);
        const chat_id = user;
        try {
          await bot.telegram.sendMessage(
            chat_id,
            `Received item: ${JSON.stringify(message)}`
          );
        } catch (error) {
          if (error.code === 429) {
            console.log("Rate limit exceeded, waiting for 1 second");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            +(await bot.telegram.sendMessage(
              message.user,
              `Received item: ${JSON.stringify(message)}`
            ));
          } else {
            throw error;
          }
        }

        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error("error occurred", err);
  }
}
