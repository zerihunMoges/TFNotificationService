import mongoose from "mongoose";

export interface INotification {
  eventId: string;
  chatId: string;
  type: string;
  messageId: string;
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

  messageId: {
    type: String,
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
