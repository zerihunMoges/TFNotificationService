import { Request, Response, NextFunction } from "express";
import { Subscription, ISubscription } from "./subscription.model";
import { subscribe } from "diagnostics_channel";

export async function getSubscriptions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { club, league } = req.query;
  try {
    let subscribers: ISubscription[] = [];
    if (!club && !league) {
      return res.status(400).json({ message: "club id or league id required" });
    }
    if (club) {
      let clubSubscribers = await Subscription.find({
        subscriptionId: club,
        type: club,
      });
      if (clubSubscribers) {
        clubSubscribers = clubSubscribers.filter(
          (subscribers) => subscribers.active
        );
        subscribers = [...clubSubscribers, ...subscribers];
      }
    }
    if (league) {
      let clubSubscribers = await Subscription.find({
        subscriptionId: league,
        type: "league",
      });
      if (clubSubscribers) {
        clubSubscribers = clubSubscribers.filter(
          (subscribers) => subscribers.active
        );
        subscribers = [...clubSubscribers, ...subscribers];
      }
    }

    return res.status(200).json({ response: subscribers });
  } catch (err) {
    console.error("error occurred while getting subscribers: ", err);
    return res.status(500).json({ message: "" });
  }
}

export async function getAllSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const subscribers = (await Subscription.find({ active: true })) || [];
    const allSubscribers = subscribers?.map((subscriber: ISubscription) => {
      const { type, subscriptionId: id } = subscriber;
      return {
        type,
        id,
      };
    });
    return res.status(200).json({ response: allSubscribers });
  } catch (err) {
    console.error("error occurred while getting all subscribers: ", err);
    return res.status(500).json({ message: "" });
  }
}
