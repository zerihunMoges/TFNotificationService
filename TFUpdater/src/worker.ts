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
  console.log("match:", matches, "expire:", expire);

  const startTime = new Date();

  try {
    const promisesArray = [];

    // If matches are not provided or the expiration time has passed, fetch new matches
    if (!matches || expire < new Date()) {
      matches = await getMatches();

      // Set the expiration time to the next hour
      const today = new Date();
      today.setMinutes(60);
      expire = today;
    }

    // Get all subscriptions
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
        // Update the match and add the promise to the array
        const promise = updateMatch(match.fixture.id);
        promisesArray.push(promise);
      }
    }

    // Wait for all promises to complete
    await Promise.all(promisesArray);
  } catch (err) {
    console.error("Error occurred in worker:", err);
  } finally {
    // Calculate the time difference and set the timeout accordingly
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - startTime.getTime();
    const timeout = timeDifference >= 60000 ? 0 : 60000 - timeDifference;

    // Wait for the specified time and then call the worker function again
    setTimeout(() => {
      startWorker(matches, expire);
    }, timeout);
  }
}
