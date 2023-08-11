import { bot } from "./telegram/bot";
import { connect } from "./db/db-setup";
import { receiveUpdates } from "./message-queue/consumer";
import express from "express";
import cors from "cors";
import { subscriptionRouter } from "./resources/clubs/subscription.route";
import { config } from "./config";
import { Connection, connect as connectMQ } from "amqplib";

const app = express();
app.use(cors({ origin: true }));
app.use("/api/subscriptions", subscriptionRouter);
export async function start() {
  try {
    await connect();
    const connection: Connection = await connectMQ(process.env.MQURL);
    config.mqConnection = connection;
    app.listen(config.port, "0.0.0.0", () => {
      console.log(`REST API on http://localhost:${config.port}/api`);
    });
    receiveUpdates();
    bot.launch();
  } catch (err) {
    config.mqConnection?.close();
    console.error("error: ", err);
  }
}
