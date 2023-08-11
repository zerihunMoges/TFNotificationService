import { Router } from "express";
import {
  getAllSubscription,
  getSubscriptions,
} from "./subscription.controller";

export const subscriptionRouter = Router();

subscriptionRouter.get("/all", getAllSubscription);
subscriptionRouter.get("", getSubscriptions);
