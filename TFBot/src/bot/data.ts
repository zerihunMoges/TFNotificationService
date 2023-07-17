import axios from "axios";

interface Data {
  [_index: string]: {
    response: any;
    expiretime: any;
  };
}
const data: Data = {
  leagues: {
    response: null,
    expiretime: null,
  },
  clubs: {
    response: null,
    expiretime: null,
  },
};

export async function getLeagues(): Promise<any> {
  if (!data.leagues.response) {
    const apiUrl = `https://footballapp-production-4327.up.railway.app/api/leagues`;

    const response = await axios.get(apiUrl);

    if (response.status !== 200) {
      console.log(`Failed to fetch standing. Status: ${response.status}`);
      return null;
    }

    const responseData = response.data;
    const date = new Date();
    date.setSeconds(date.getSeconds() + responseData.expire_time);

    data.leagues.response = responseData.response;
    data.leagues.expiretime = date;

    return data.leagues.response;
  }

  return data.leagues.response;
}
