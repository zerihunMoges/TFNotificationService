import axios from "axios";
import { config } from "./config";
import { match } from "assert";
import { sendMessages } from "./message-queue/producer";
import { updateMatch } from "./resources/match-event/match-event.service";
import { IMatch } from "./resources/match-event/match-event.type";
import { connect } from "./db/db-setup";
import { connect as connectMQ, Connection } from "amqplib";
import { scheduleWorker, startWorker } from "./worker";

export async function start() {
  try {
    await connect();
    scheduleWorker();
  } catch (err) {
    console.error(err);
  }
}
