import axios from "axios";
import exp from "constants";
import { config } from "../config";
import leagues from "./data/leagues.json";

export function getLeagues(): any[] {
  const response = leagues as any[];
  return response;
}

export function getLeague(id) {
  const response = leagues as any[];

  return response.filter(
    ({ league }) => league.id.toString() === id.toString()
  )[0];
}

export async function getClubs(country: string) {
  const apiUrl = config.apiUrl + `/clubs?country=${country}`;

  const response = await axios.get(apiUrl);

  if (response.status !== 200) {
    console.log(`Failed to fetch clubs. Status: ${response.status}`);
    return null;
  }

  const responseData = response.data;
  return responseData.response;
}

export async function getClub(id: string) {
  const apiUrl = config.apiUrl + `/clubs?id=${id}`;

  const response = await axios.get(apiUrl);

  if (response.status !== 200) {
    console.log(`Failed to fetch clubs. Status: ${response.status}`);
    return null;
  }

  const responseData = response.data;
  return responseData.response[0];
}
