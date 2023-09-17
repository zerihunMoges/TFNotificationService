import axios from "axios";
import { config } from "../../config";
import { IEvent, ILineup, IMatch, IMatchEvent } from "./match-event.type";
import { MatchEvent } from "./match-event.model";
import { sendMessages } from "../../message-queue/producer";
import { isEventChanged, isMatchOver, isPlaying } from "./match-event.helpers";
import {
  Notification,
  NotificationSetting,
} from "../../response-types/subscription.type";
import { MatchData } from "../../response-types/match.type";
import { Document, Types } from "mongoose";

export async function getMatch(matchId: number) {
  const res = await axios.get(`${config.baseUrl}/matches/${matchId}`);
  if (res.status !== 200) {
    console.error("failed to fetch match with id: ", matchId);
    throw new Error("failed to fetch match");
  }

  return res.data;
}

function deDuplicateListeners(notifications: Notification[]): Notification[] {
  const deduplicatedNotifications = {};

  notifications.forEach((notification) => {
    const { user, channel, targetType, type } = notification;

    const key = targetType === "user" ? user.toString() : channel.toString();

    if (!deduplicatedNotifications[key]) {
      deduplicatedNotifications[key] = { ...notification };
    } else {
      if (type === "club" && deduplicatedNotifications[key].type !== "club") {
        deduplicatedNotifications[key] = notification;
      } else if (
        type === "club" &&
        deduplicatedNotifications[key].type === "club"
      ) {
        const mergedSettings: NotificationSetting = {};
        for (const setting in notification.notificationSetting) {
          mergedSettings[setting] =
            deduplicatedNotifications[key].notificationSetting[setting] ||
            notification.notificationSetting[setting];
        }
        deduplicatedNotifications[key].notificationSetting = mergedSettings;
      }
    }
  });

  return Object.values(deduplicatedNotifications);
}

export async function getListeners(
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
  const listenersRes: Notification[] = res.data.response;

  return deDuplicateListeners(listenersRes);
}

export async function updateEvents(
  match: MatchData,
  prevMatchData: Document<unknown, any, IMatchEvent> &
    Omit<
      IMatchEvent & {
        _id: Types.ObjectId;
      },
      never
    >,
  users: Notification[]
) {
  try {
    const { events: preEvents } = prevMatchData || { events: [] };
    const { teams, events } = match || { events: [] };

    if (preEvents.length - events.length > 1) return;
    let homeScore = 0;
    let awayScore = 0;
    let homePenalty = 0;
    let awayPenalty = 0;
    for (
      let _index = 0;
      _index < Math.max(events.length, preEvents.length);
      _index++
    ) {
      let event: IEvent;

      if (_index < events.length) event = events[_index];
      const { team, player, assist, time, type, detail, comments } =
        event || {};
      if (
        type?.toLowerCase() === "goal" &&
        detail?.toLowerCase() !== "missed penalty"
      ) {
        team?.id === teams?.home?.id
          ? comments?.toLowerCase() !== "penalty shootout"
            ? (homeScore += 1)
            : (homePenalty += 1)
          : comments?.toLowerCase() !== "penalty shootout"
          ? (awayScore += 1)
          : (awayPenalty += 1);
      }

      if (_index >= preEvents.length) {
        await sendMessages(
          {
            action: "post",
            teams: match.teams,
            type: "event",
            matchId: match.fixture.id,
            data: {
              id: _index,
              goals: { home: homeScore, away: awayScore },
              penalty: { home: homePenalty, away: awayPenalty },
              ...event,
            },
          },
          users
        );
      } else if (
        _index < events.length &&
        isEventChanged(preEvents[_index], event)
      ) {
        await sendMessages(
          {
            action: "put",
            teams: teams,
            type: "event",
            matchId: match.fixture.id,
            data: {
              id: _index,
              goals: { home: homeScore, away: awayScore },
              ...event,
            },
          },
          users
        );
      } else if (_index >= events.length) {
        await sendMessages(
          {
            action: "delete",
            teams: teams,
            type: "event",
            matchId: match.fixture.id,
            data: {
              id: _index,
              goals: { home: homeScore, away: awayScore },
            },
          },
          users
        );
      }
    }

    await prevMatchData.updateOne({ events: match.events });
  } catch (err) {
    console.error("error occured while updating events", err);
  }
}

export async function updateLineups(
  prevMatch: Document<unknown, any, IMatchEvent> &
    Omit<
      IMatchEvent & {
        _id: Types.ObjectId;
      },
      never
    >,
  lineups: ILineup[],
  prevLineups: ILineup[],
  users: Notification[],
  matchId: string | number
) {
  try {
    if ((!prevLineups || prevLineups.length === 0) && lineups.length === 2) {
      await sendMessages(
        {
          action: "post",
          matchId: matchId,
          type: "lineup",
          data: lineups,
        },
        users
      );
    }
    await prevMatch.updateOne({ lineups });
  } catch (err) {
    console.error("error occured updating lineups", err);
  }
}

export async function updateBreaks(
  prevMatch: Document<unknown, any, IMatchEvent> &
    Omit<
      IMatchEvent & {
        _id: Types.ObjectId;
      },
      never
    >,
  match: MatchData,
  users: Notification[]
) {
  try {
    const prevMatchStatus = prevMatch?.status;
    const matchStatus = match.fixture.status.short;
    const matchId = match.fixture.id;
    const goals = match.goals;
    const penalty = match.score.penalty;
    const teams = match.teams;
    if (!isPlaying(matchStatus) && prevMatchStatus !== matchStatus) {
      await sendMessages(
        {
          action: "post",
          matchId: matchId,
          teams: teams,
          type: matchStatus,
          data: {
            goals: goals,
            penalty: penalty,
            statistics: match.statistics,
          },
        },
        users
      );
    }
    await prevMatch.updateOne({ status: matchStatus });
  } catch (err) {
    console.error("error occured while updaiting breaks", err);
  }
}

export async function updateMatch(matchId: number) {
  try {
    let prevMatch = await MatchEvent.findOneAndUpdate(
      { matchId },
      { matchId },
      { upsert: true, new: true }
    );
    if (prevMatch && isMatchOver(prevMatch.status)) {
      return;
    }

    const matchRes = await getMatch(matchId);
    const { response, expire_time } = matchRes;
    const match: MatchData = response;
    if (!response) return;

    const users = await getListeners(
      match.teams.home.id,
      match.teams.away.id,
      match.league.id,
      match.fixture.id
    );

    await updateEvents(match, prevMatch, users);
    await updateLineups(
      prevMatch,
      match?.lineups,
      prevMatch?.lineups,
      users,
      matchId
    );
    await updateBreaks(prevMatch, match, users);
  } catch (err) {
    console.error(err.message);
  }
}
