import axios from "axios";
import { config } from "../../config";
import { IEvent, ILineup, IMatch, IMatchEvent } from "./match-event.type";
import { MatchEvent } from "./match-event.model";
import { sendMessages } from "../../message-queue/producer";
import { Subscribers } from "../../data/subscribers";
import { isEventChanged, isMatchOver } from "./match-event.helpers";
import exp from "constants";

export async function getMatch(matchId: number) {
  const res = await axios.get(`${config.baseUrl}/matches/${matchId}`);
  if (res.status !== 200) {
    console.error("failed to fetch match with id: ", matchId);
    throw new Error("failed to fetch match");
  }

  return res.data;
}

export async function getListenersID(
  homeId: number,
  awayId: number,
  leagueId: number,
  matchId: number
) {
  let res = await axios.get(
    config.clientUrl +
      `?home=${homeId}&away=${awayId}&league=${leagueId}&match=${matchId}`
  );

  if (res.status !== 200) {
    console.error(
      "failed to get subscribers for match, trying again after 1 minute: ",
      matchId
    );
    throw new Error("Failed to fetch Listners");
  }
  const listenersRes = res.data.response || [];

  const listenersResID = listenersRes.map((s: any) => s.chatId);
  return listenersResID;
}

export async function updateEvents(
  match: IMatch,
  prevMatchData: IMatch,
  users: number[]
) {
  const { events: preEvents } = prevMatchData || { events: [] };
  const { teams, events } = match || { events: [] };
  let homeScore = 0;
  let awayScore = 0;
  let newEvents = [];

  for (let _index = 0; _index < events.length; _index++) {
    const event = events[_index];
    const { team, player, assist, time, type, detail, comments } = event || {};
    if (
      type.toLowerCase() === "goal" &&
      detail.toLowerCase() !== "missed penalty"
    ) {
      {
        team?.id === teams?.home?.id ? (homeScore += 1) : (awayScore += 1);
      }
    }

    if (_index >= preEvents.length) {
      console.log("sent new event to", users, event.type);
      await sendMessages(
        {
          action: "post",
          teams: match.teams,
          type: "event",
          data: {
            id: _index,
            goals: { home: homeScore, away: awayScore },
            ...event,
          },
        },
        users
      );
    } else if (isEventChanged(preEvents[_index], event)) {
      console.log("sent update event to", users, event.type);
      await sendMessages(
        {
          action: "put",
          teams: teams,
          type: "event",
          data: {
            id: _index,
            goals: { home: homeScore, away: awayScore },
            ...event,
          },
        },
        users
      );
    }
  }
}

export async function updateLineups(
  lineups: ILineup[],
  prevLineups: ILineup[],
  users: number[]
) {
  console.log("###### got lineup, should send if it is different");
  if (JSON.stringify(lineups) !== JSON.stringify(prevLineups)) {
    console.log("########################### yeah i have sent it ");
    sendMessages(
      {
        action: prevLineups && prevLineups.length > 0 ? "put" : "post",
        type: "lineup",
        data: lineups,
      },
      users
    );
  }
}

export async function updateMatch(matchId: number) {
  try {
    const matchRes = await getMatch(matchId);
    const { response, expire_time } = matchRes;
    const match: IMatch = response;
    const users = await getListenersID(
      match?.teams?.home?.id,
      match?.teams?.away?.id,
      match?.league?.id,
      match?.fixture?.id
    );

    let prevMatch: IMatch = await MatchEvent.findOne({ matchId: matchId });
    updateEvents(match, prevMatch, users);
    updateLineups(match?.lineups, prevMatch?.lineups, users);

    await MatchEvent.findOneAndUpdate(
      { matchId: matchId },
      {
        matchId,
        teams: match.teams,
        events: match.events,
        lineups: match.lineups,
      },
      { upsert: true }
    );

    const date = new Date();
    const maxMatchLength = 150 * 60 * 1000;
    if (!isMatchOver(match?.fixture?.status?.short)) {
      expire_time &&
        setTimeout(
          () => updateMatch(matchId),
          Math.max(new Date(expire_time).getTime() - date.getTime(), 60000)
        );
    } else {
      await sendMessages(
        {
          action: "post",
          teams: match?.teams,
          type: "event",
          data: {
            goals: match?.goals,
            penalty: match?.score?.penalty,
            type: "FT",
          },
        },
        users
      );
    }
  } catch (err) {
    console.error(err.message);
    setTimeout(() => updateMatch(matchId), 60000);
  }
}
