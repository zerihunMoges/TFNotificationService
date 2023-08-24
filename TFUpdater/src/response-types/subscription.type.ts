import mongoose from "mongoose";

export interface Subscription {
  type: "league" | "club";
  notId: number;
}

export interface Notification {
  user?: mongoose.Types.ObjectId;
  channel?: mongoose.Types.ObjectId;
  targetType: string;
  type: string;
  notId: string;
}
