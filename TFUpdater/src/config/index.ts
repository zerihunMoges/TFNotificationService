require("dotenv").config();
export const config = {
  baseUrl: process.env.BASEURL,
  mongoUrl: process.env.DATABASEURL,
  MQUrl: process.env.MQURL,
  port: process.env.PORT || "5001",
  clientUrl:
    process.env.CLIENTURL || "http://5.75.143.191:8001/api/subscriptions",
  mqConnection: null,
};
