import { connect, Connection, Channel } from "amqplib";
import { getConnection, releaseConnection } from "./connection-pool";
import { config } from "../config";

export async function sendMessages(message: any, users: any[]) {
  console.log("message,", message, users);
  let connection: Connection = config.mqConnection;

  try {
    const channel: Channel = await connection.createChannel();
    const queue = "updates";
    await channel.assertQueue(queue);

    for (const user of users) {
      const userMessage = { message, user };
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(userMessage)), {
        expiration: 3 * 60000,
      });
    }
    await channel.close();
  } catch (err) {
    console.error("error occured", err);
  } finally {
    if (connection) releaseConnection(connection);
  }
}
