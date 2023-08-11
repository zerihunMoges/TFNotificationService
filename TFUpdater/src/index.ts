import axios from "axios";
import { config } from "./config";
import { match } from "assert";
import { sendMessages } from "./message-queue/producer";
import { updateMatch } from "./resources/match-event/match-event.service";
import { IMatch } from "./resources/match-event/match-event.type";
import { connect } from "./db/db-setup";
import { connect as connectMQ, Connection } from "amqplib";

const data = {};
export async function getTodaysMatches() {
  const res = await axios.post(
    `${config.baseUrl}/matches?date=${new Date().toISOString().slice(0, 10)}`
  );
  if (res.status !== 200) {
    console.error("cant fetch match");
  }

  return res.data.response;
}
export async function start() {
  try {
    await connect();
    const connection: Connection = await connectMQ(config.MQUrl);
    config.mqConnection = connection;
    const response = await axios.get(config.clientUrl + "/all");
    const subscriptions = response.data.response;

    const leagues = (await getTodaysMatches()) || [];
    leagues?.forEach((league) => {
      if (
        subscriptions.some(
          (s) => s.type === "league" && s.id === league?.league?.id?.toString()
        )
      ) {
        league.matches.forEach((match: IMatch) => {
          updateMatch(match.fixture.id);
        });
      } else {
        for (const match of league?.matches) {
          if (
            subscriptions.some(
              (s) =>
                (s.type === "club" &&
                  s.id.toString() === match?.teams?.home?.id?.toString()) ||
                (s.type === "club" &&
                  s.id.toString() === match?.teams?.away?.id?.toString())
            )
          ) {
            updateMatch(match.fixture.id);
          }
        }
      }
    });
  } catch (err) {
    console.error(err);
  }
}
