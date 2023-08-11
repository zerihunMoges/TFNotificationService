export interface Teams {
  home: Team;
  away: Team;
}

export interface Team {
  id: number;
  logo: string;
  name: string;
  winner: boolean;
}
