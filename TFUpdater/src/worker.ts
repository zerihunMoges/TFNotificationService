import axios from "axios";
import { config } from "./config";
import { MatchData, MatchGroup } from "./response-types/match.type";
import { updateMatch } from "./resources/match-event/match-event.service";
import { Subscription } from "./response-types/subscription.type";

export async function getLiveMatches(): Promise<MatchData[]> {
  const res = await axios.post(`${config.baseUrl}/matches?live=true`);

  if (res.status !== 200) {
    console.error(`failed to fetch match`, res.data?.message);
    throw new Error(`failed to fetch match with status ${res.status}`);
  }

  const response: MatchGroup[] = res.data.response;
  return response.reduce((flatMatch, matches) => {
    return [...flatMatch, ...matches.matches];
  }, []);
}

export async function getUpcomingMatches(): Promise<MatchData[]> {
  const today = new Date();
  today.setHours(today.getHours() + 1);

  const res = await axios.post(
    `${config.baseUrl}/matches?date=${today.toISOString().slice(0, 10)}`
  );

  if (res.status !== 200) {
    console.error(`failed to fetch match`, res.data?.message);
    throw new Error(`failed to fetch match with status ${res.status}`);
  }
  const response: MatchGroup[] = res.data.response;
  return response.reduce((flatMatch, matches) => {
    return [...flatMatch, ...matches.matches];
  }, []);
}

export async function getMatches(): Promise<MatchData[]> {
  try {
    const live = await getLiveMatches();
    const upcoming = await getUpcomingMatches();
    const unique = new Set();
    return [...live, ...upcoming].reduce((matches, match) => {
      if (!unique.has(match.fixture.id)) matches.push(match);
      return matches;
    }, []);
  } catch (err) {
    console.error("error occurred while getting matches", err);
    throw err;
  }
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const res = await axios.get(config.clientUrl + "/all");
  if (res.status !== 200) {
    console.error(`failed to fetch all subscriptions`, res.data?.message);
    throw new Error(`failed to fetch subscriptions with status ${res.status}`);
  }
  const subscriptions = res.data.response;
  return subscriptions;
}

export async function startWorker(matches = null, expire = null) {
  console.log("match", "expire", expire);
  const start = new Date();
  try {
    const promisesArray: Promise<void>[] = [];

    if (!matches || expire < new Date()) {
      matches = await getMatches();
      const today = new Date();
      const hour = 60;
      today.setMinutes(today.getMinutes() + (today.getMinutes() % hour));
      expire = today;
    }
    const subscriptions = await getAllSubscriptions();
    for (const match of matches) {
      if (
        match &&
        subscriptions.some(
          (s) =>
            (s.type === "club" &&
              s.notId?.toString() === match.teams?.home?.id?.toString()) ||
            (s.type === "club" &&
              s.notId?.toString() === match.teams?.away?.id?.toString()) ||
            (s.type === "league" &&
              s.notId?.toString() === match.league?.id?.toString())
        )
      ) {
        const promise = updateMatch(match.fixture.id);
        promisesArray.push(promise);
      }
    }

    await Promise.all(promisesArray);
  } catch (err) {
    console.error("error occured in worker", err);
  } finally {
    const time = new Date();
    const dif =
      time.getTime() - start.getTime() < 60000 ? time.getSeconds() % 60 : 1;
    setTimeout(() => startWorker(matches, expire), dif * 1000);
  }
}