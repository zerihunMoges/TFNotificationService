require("dotenv").config();
export const config = {
  baseUrl: process.env.BASEURL,
  mongoUrl: process.env.DATABASEURL,
  MQUrl: process.env.MQURL,
  port: process.env.PORT || "5001",
  clientUrl: process.env.CLIENTURL || "http://127.0.0.1:8001/api/subscriptions",
  mqConnection: null,
};
