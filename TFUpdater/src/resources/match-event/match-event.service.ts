import axios from "axios";
import { config } from "../../config";
import { IEvent, ILineup, IMatch, IMatchEvent } from "./match-event.type";
import { MatchEvent } from "./match-event.model";
import { sendMessages } from "../../message-queue/producer";
export async function updateMatch(matchId: number) {
  try {
    const res = await axios.get(`${config.baseUrl}/matches/${matchId}`);
    if (res.status !== 200) {
      console.error("failed to fetch match with id: ", matchId);
      return setTimeout(() => updateMatch(matchId), 60000);
    }

    console.log("got new match data for", matchId);

    const { response, expire_time } = res.data;
    const match: IMatch = response[0];
    let preEvents: IEvent[] = [];
    let preLineups: ILineup[] = [];

    let prevData = await MatchEvent.findOne({ matchId: matchId });
    if (prevData) {
      preEvents = prevData.events;
      preLineups = prevData.lineups;
    }

    let users = [463757409];

    const newEvents = match.events.slice(preEvents.length, match.events.length);

    newEvents.forEach((event: IEvent) => {
      sendMessages({ type: "event", data: event }, users);
    });

    if (preLineups.length === 0 && match.lineups.length > 0) {
      sendMessages({ type: "lineup", data: match.lineups }, users);
    }

    await MatchEvent.findOneAndUpdate(
      { matchId: matchId },
      {
        matchId,
        events: match.events,
        lineups: match.lineups,
      },
      { upsert: true }
    );

    const date = new Date();
    const maxMatchLength = 150 * 60 * 1000;
    if (
      expire_time <= 60 ||
      new Date().getTime() - new Date(match.fixture.date).getTime() >
        -maxMatchLength
    ) {
      setTimeout(() => updateMatch(matchId), expire_time * 1000 + 10);
    }
  } catch (err) {
    console.error(err.message);
  }
}
