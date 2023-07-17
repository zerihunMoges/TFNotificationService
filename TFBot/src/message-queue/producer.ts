import { connect, Connection, Channel } from "amqplib";
import { getConnection, releaseConnection } from "./connection-pool";

export async function sendMessages(message: any, users: string[]) {
  const connection = await getConnection();

  try {
    const channel: Channel = await connection.createChannel();
    const queue = "updates";
    await channel.assertQueue(queue);

    for (const user of users) {
      const userMessage = { message, user };
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(userMessage)));
    }

    await channel.close();
  } finally {
    releaseConnection(connection);
  }
}
