import mongoose from "mongoose";

export interface IChannel {
  title: string;
  chatId: number;
  username: string;
  userChatId: number;
}

const ChannelSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  chatId: {
    type: String || Number,
    required: true,
  },
  username: {
    type: String,
  },
  userChatId: {
    type: Number,
    required: true,
  },
});

export const Channel = mongoose.model<IChannel>("Channel", ChannelSchema);
