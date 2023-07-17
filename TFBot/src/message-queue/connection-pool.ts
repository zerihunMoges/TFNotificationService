import { connect, Connection } from "amqplib";

const MAX_CONNECTIONS = 19;
const connectionPool: Connection[] = [];

export async function getConnection(): Promise<Connection> {
  if (connectionPool.length > 0) {
    return connectionPool.pop()!;
  }

  if (connectionPool.length < MAX_CONNECTIONS) {
    const connection = await connect("amqp://guest:guest@localhost:5672");
    return connection;
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
  return getConnection();
}

export function releaseConnection(connection: Connection) {
  connectionPool.push(connection);
}
