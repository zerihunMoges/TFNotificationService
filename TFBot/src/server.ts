import { bot } from "./bot/bot";
import { receiveUpdates } from "./message-queue/consumer";

export async function start() {
  try {
    receiveUpdates();
    console.log("reciving updates");
    bot.launch();
    console.log("bot launched");
  } catch (err) {
    console.error("error: ", err);
  }
}
