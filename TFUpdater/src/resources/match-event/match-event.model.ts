import mongoose, { Schema } from "mongoose";
import {
  IMatchEvent,
  IEvent,
  ILineup,
  IEventTeam,
  ITime,
  IEventPlayer,
  IAssist,
  ILineupTeam,
  ILineupCoach,
  ILineupPlayer,
  ITeams,
  ITeam,
} from "./match-event.type";

const EventTeamSchema = new Schema<IEventTeam>({
  id: Number,
  name: String,
  logo: String,
  winner: Boolean,
});

const TeamSchema = new Schema<ITeam>({
  id: Number,
  logo: String,
  name: String,
  winner: Boolean,
});

const TeamsSchema = new Schema<ITeams>({
  home: TeamSchema,
  away: TeamSchema,
});

const TimeSchema = new Schema<ITime>({
  elapsed: Number,
  extra: Number,
});

const EventPlayerSchema = new Schema<IEventPlayer>({
  id: Number,
  name: String,
});

const AssistSchema = new Schema<IAssist>({
  id: Number,
  name: String,
});

const EventSchema = new Schema<IEvent>({
  time: TimeSchema,
  team: EventTeamSchema,
  player: EventPlayerSchema,
  assist: AssistSchema,
  type: String,
  detail: String,
  comments: String,
});

const LineupPlayerSchema = new Schema<ILineupPlayer>({
  id: Number,
  name: String,
  number: Number,
  pos: String,
  grid: String,
});

const LineupTeamSchema = new Schema<ILineupTeam>({
  id: Number,
  name: String,
  logo: String,
  colors: {
    player: {
      primary: String,
      number: String,
      border: String,
    },
    goalkeeper: {
      primary: String,
      number: String,
      border: String,
    },
  },
});

const LineupCoachSchema = new Schema<ILineupCoach>({
  id: Number,
  name: String,
  photo: String,
});

const LineupSchema = new Schema<ILineup>({
  team: LineupTeamSchema,
  coach: LineupCoachSchema,
  formation: String,
  startXI: [{ player: LineupPlayerSchema }],
  substitutes: [{ player: LineupPlayerSchema }],
});

const MatchEventSchema = new mongoose.Schema({
  matchId: {
    type: Number,
    unique: true,
    required: true,
  },
  status: String,
  teams: TeamsSchema,
  events: [EventSchema],
  lineups: [LineupSchema],
});

export const MatchEvent = mongoose.model<IMatchEvent>(
  "MatchEvent",
  MatchEventSchema
);
