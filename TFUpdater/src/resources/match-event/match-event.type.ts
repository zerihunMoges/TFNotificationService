import mongoose from "mongoose";

export interface IMatchEvent {
  matchId: number;
  events: IEvent[];
  lineups: ILineup[];
}
export interface IMatch extends IMatchEvent {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
    };
  };
  league: ILeague;
  teams: ITeams;
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}
export interface IEventTeam {
  id: number;
  name: string;
  logo: string;
  winner: boolean;
}
export interface ILeague {
  id: number;
  name: string;
  type: string;
  logo: string;
}
export interface ITeams {
  home: ITeam;
  away: ITeam;
}

export interface ITeam {
  id: number;
  logo: string;
  name: string;
  winner: boolean;
}

export interface IEvent {
  time: ITime;
  team: IEventTeam;
  player: IEventPlayer;
  assist: IAssist;
  type: string;
  detail: string;
  comments: string | null;
}

export interface ITime {
  elapsed: number;
  extra: null;
}

export interface IEventPlayer {
  id: number;
  name: string;
}

export type IAssist = {
  id: number | null;
  name: string | null;
};

export interface ILineupPlayer {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid: string | null;
}

export interface ILineupTeam {
  id: number;
  name: string;
  logo: string;
  colors: {
    player: {
      primary: string;
      number: string;
      border: string;
    };
    goalkeeper: {
      primary: string;
      number: string;
      border: string;
    };
  };
}

export interface ILineupCoach {
  id: number;
  name: string;
  photo: string;
}

export interface ILineup {
  team: ILineupTeam;
  coach: ILineupCoach;
  formation: string;
  startXI: {
    player: ILineupPlayer;
  }[];
  substitutes: {
    player: ILineupPlayer;
  }[];
}
