import mongoose from "mongoose";
import { config } from "../config";

export const connect = async (url = config.mongoUrl) => {
  mongoose.set("strictQuery", false);
  await mongoose.connect(url);
  const db = mongoose.connection;

  db.once("open", function () {
    console.log("Connected to Atlas MongoDB database!");
  });
};
