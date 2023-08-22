import mongoose from "mongoose";

export interface INotification {
  eventId: string;
  chatId: string | number;
  matchId: string | number;
  type: string;
  messageId: number;
}

const NotificationSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
  },
  chatId: {
    type: String || Number,
    required: true,
  },
  matchId: { type: String || Number, required: true },

  messageId: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
