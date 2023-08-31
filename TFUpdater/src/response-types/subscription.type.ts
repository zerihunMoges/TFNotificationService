import mongoose from "mongoose";

export interface Subscription {
  type: "league" | "club";
  notId: number;
}

export interface Notification {
  _id: string;
  user?: string;
  channel?: string;
  targetType: "channel" | "user";
  type: string;
  notId: string;
  notificationSetting: NotificationSetting;
}

export interface NotificationSetting {
  goal?: boolean;
  redCard?: boolean;
  var?: boolean;
  yellowCard?: boolean;
  lineups?: boolean;
  substitution?: boolean;
  break?: boolean;
  FT?: boolean;
}
