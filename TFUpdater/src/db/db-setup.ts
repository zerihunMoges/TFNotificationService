import mongoose from "mongoose";
import { config } from "../config";

export const connect = async (url = config.mongoUrl) => {
  await mongoose.connect(url);

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function () {
    // We're connected!
    console.log("Connected to Atlas MongoDB database!");
  });
};
