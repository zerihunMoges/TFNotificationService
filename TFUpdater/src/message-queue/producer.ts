import { connect, Connection, Channel } from "amqplib";
import { getConnection, releaseConnection } from "./connection-pool";

export async function sendMessages(message: any, users: any[]) {
  let connection: Connection;

  try {
    connection = await getConnection();
    const channel: Channel = await connection.createChannel();
    const queue = "updates";
    await channel.assertQueue(queue);

    for (const user of users) {
      const userMessage = { message, user };
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(userMessage)));
    }

    await channel.close();
  } catch (err) {
    console.error("error occured", err);
  } finally {
    if (connection) releaseConnection(connection);
  }
}
