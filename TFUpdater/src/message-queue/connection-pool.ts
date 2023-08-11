import { connect, Connection } from "amqplib";
import { config } from "../config";

let MAX_CONNECTIONS = 1;
const connectionPool: Connection[] = [];

export async function getConnection(): Promise<Connection> {
  if (connectionPool.length > 0) {
    return connectionPool.pop()!;
  }

  if (MAX_CONNECTIONS > 0) {
    const connection = await connect(config.MQUrl);
    MAX_CONNECTIONS -= 1;
    return connection;
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
  return getConnection();
}

export function releaseConnection(connection: Connection) {
  connectionPool.push(connection);
}
