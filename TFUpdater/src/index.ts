import axios from "axios";
import { config } from "./config";
import { match } from "assert";
import { sendMessages } from "./message-queue/producer";
import { updateMatch } from "./resources/match-event/match-event.service";
import { IMatch } from "./resources/match-event/match-event.type";
import { connect } from "./db/db-setup";

const data = {};

export async function start() {
  try {
    await connect();

    const matches = await axios.get(
      `${config.baseUrl}/matches?date=${new Date().toISOString().slice(0, 10)}`
    );
    if (matches.status !== 200) {
      console.error("cant fetch match");
    }
    const subMatches: any[] = [1003695, 1031980];

    const leagues = matches.data.response;
    leagues.forEach((league) => {
      league.matches
        .filter((match) => subMatches.includes(match.fixture.id))
        .forEach((match: IMatch) => {
          updateMatch(match.fixture.id);
        });
    });
  } catch (err) {
    console.error(err);
  }
}
