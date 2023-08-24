import { Channel } from "amqplib";
import { Factory, createPool } from "generic-pool";
import { amqpConnectionPool } from "./connectionPool";

const opts = {
  max: 50,
  min: 1,
};
const factory: Factory<Channel> = {
  create: async () => {
    const connection = await amqpConnectionPool.acquire();
    const channel: Channel = await connection.createChannel();
    await channel.assertExchange("updates", "direct");
    await channel.assertQueue("user");
    await channel.bindQueue("user", "updates", "user");
    await channel.assertQueue("channel");
    await channel.bindQueue("channel", "updates", "channel");
    return channel;
  },
  destroy: (channel: Channel) => {
    const connection = channel.connection;
    amqpConnectionPool.release(connection);
    return channel.close();
  },
};
export const channelPool = createPool(factory, opts);
