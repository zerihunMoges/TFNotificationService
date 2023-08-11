import { bot } from "./bot/bot";
import { connect } from "./db/db-setup";
import { receiveUpdates } from "./message-queue/consumer";

export async function start() {
  try {
    await connect();
    receiveUpdates();
    bot.launch();
  } catch (err) {
    console.error("error: ", err);
  }
}
