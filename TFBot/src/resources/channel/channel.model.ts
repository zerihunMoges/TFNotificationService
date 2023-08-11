import mongoose, { Schema } from "mongoose";

export interface IChannel {
  title: string;
  chatId: number;
  username: string;
  userChatIds: number[];
  postFormats?: PostFormats;
}

export interface PostFormats {
  [_index: string]: string;
}

const PostFormatsSchema = new Schema({
  goal: {
    type: String,
    default:
      "<b>{time}+{extra}' Goal for {team},</b>\n\n{hometeam} {homegoal} - {awaygoal} {awayteam}\n\n<b>Goal</b> - {player}\n<b>Assist</b> - {assist}",
  },
  "own goal": {
    type: String,
    default:
      "<b>{time}+{extra}' Goal for {team},</b>\n\n{hometeam} {homegoal} - {awaygoal} {awayteam}\n\n<b>Own Goal</b> - {player}",
  },
  penalty: {
    type: String,
    default:
      "<b>{time}+{extra}' Goal for {team},</b>\n\n{hometeam} {homegoal} - {awaygoal} {awayteam}\n\n<b>Goal</b> - {player} (Penalty)",
  },
  subst: {
    type: String,
    default:
      "<b>{time}+{extra}',</b>  Substitution by {team}, {in} replaces {out}.",
  },
  "yellow card": {
    type: String,
    default: "<b>{time}+{extra}',  🟨 Yellow card, {player} ({team})",
  },
  "red card": {
    type: String,
    default: "<b>{time}',  🟥 Red card, {player} ({team})",
  },
  "missed penalty": {
    type: String,
    default:
      "{time}' Penalty Missed, {player} ({team})\n\n{hometeam} {homegoal} - {awaygoal} {awayteam}",
  },
});

const ChannelSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  chatId: {
    type: String || Number,
    unique: true,
    required: true,
  },
  username: {
    type: String,
  },
  userChatIds: {
    type: [Number],
    required: true,
  },
  postFormats: {
    type: PostFormatsSchema,
    default: {
      goal: "<b>{time}' Goal for {team},</b>\n\n{hometeam} {homegoal} - {awaygoal} {awayteam}\n\n<b>Goal</b> - {player}\n<b>Assist</b> - {assist}",

      "own goal":
        "<b>{time}' Goal for {team},</b>\n\n{hometeam} {homegoal} - {awaygoal} {awayteam}\n\n<b>Own Goal</b> - {player}",

      penalty:
        "<b>{time}' Goal for {team},</b>\n\n{hometeam} {homegoal} - {awaygoal} {awayteam}\n\n<b>Goal</b> - {player} (Penalty)",

      subst: "<b>{time}',</b>  Substitution by {team}, {in} replaces {out}.",

      "yellow card": "<b>{time}'</b>,  🟨 Yellow card, {player} ({team})",

      "red card": "<b>{time}'</b>,  🟥 Red card, {player} ({team})",

      "missed penalty":
        "{time}+{extra}' Penalty Missed, {player} ({team})\n\n{hometeam} {homegoal} - {awaygoal} {awayteam}",
    },
  },
});

export const Channel = mongoose.model<IChannel>("Channel", ChannelSchema);
