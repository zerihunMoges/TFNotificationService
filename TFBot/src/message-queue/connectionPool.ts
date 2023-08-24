import { Connection, connect } from "amqplib";
import { createPool } from "generic-pool";
import { config } from "../config";

const opts = {
  max: 10,
  min: 1,
};
const factory = {
  create: async () => {
    const connection = await connect(config.MQUrl);
    return connection;
  },
  destroy: (connection: Connection) => {
    return connection.close();
  },
};
const amqpConnectionPool = createPool(factory, opts);
const cleanup = async () => {
  await amqpConnectionPool.drain();
  await amqpConnectionPool.clear();
};

export { amqpConnectionPool, cleanup };
