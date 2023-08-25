export type Fixture = {
  id: number;
  referee: string;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first: number;
    second: number;
  };
  venue: {
    id: number;
    name: string;
    city: string;
  };
  status: {
    long: string;
    short: string;
    elapsed: number;
  };
};

export type League = {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
  round: string;
};

export type Team = {
  id: number;
  name: string;
  logo: string;
  winner: boolean;
};

export type Goals = {
  home: number;
  away: number;
};

export type Score = {
  halftime: {
    home: number;
    away: number;
  };
  fulltime: {
    home: number;
    away: number;
  };
  extratime: {
    home: number;
    away: number;
  };
  penalty: {
    home: number;
    away: number;
  };
};

export type Time = {
  elapsed: number;
  extra: null;
};

export type Player = {
  id: number;
  name: string;
};

export type Assist = {
  id: number | null;
  name: string | null;
};

export type Event = {
  time: Time;
  team: Team;
  player: Player;
  assist: Assist;
  type: string;
  detail: string;
  comments: string | null;
};

export type MatchData = {
  fixture: Fixture;
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: Goals;
  score: Score;
  events: Event[];
  lineups: any;
  statistics: any;
};

export type MatchGroup = {
  league: League;
  matches: MatchData[];
};
