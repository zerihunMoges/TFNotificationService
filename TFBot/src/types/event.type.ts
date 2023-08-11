export interface Event {
  id: string;
  goals: {
    home: number;
    away: number;
  };
  team: {
    id: number;
    logo: string;
    name: string;
  };
  time: {
    extra: number | null;
    elapsed: number;
  };
  type: string;
  assist: {
    id: null | number;
    name: null | string;
  };
  detail: string;
  player: {
    id: number;
    name: string;
  };
  comments: string | null;
}
