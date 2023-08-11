import mongoose from "mongoose";

export interface ISubscription {
  subscriptionId: string;
  type: string;
  chatId: number | string;
  chatName: string;
  subscriptionName?: string;
  goal: boolean;
  redCard?: boolean;
  var?: boolean;
  yellowCard?: boolean;
  lineups?: boolean;
  substitution?: boolean;
  active?: boolean;
}

const SubscriptionSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  chatId: {
    type: String || Number,
    required: true,
  },
  chatName: {
    type: String,
  },
  subscriptionId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  subscriptionName: {
    type: String || Number,
  },
  goal: {
    type: Boolean,
    default: true,
  },
  redCard: {
    type: Boolean,
    default: false,
  },
  var: {
    type: Boolean,
    default: false,
  },
  yellowCard: {
    type: Boolean,
    default: false,
  },
  lineups: {
    type: Boolean,
    default: false,
  },
  substitution: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
});

export const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  SubscriptionSchema
);
