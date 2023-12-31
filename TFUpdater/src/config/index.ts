require("dotenv").config();
export const config = {
  baseUrl: process.env.BASEURL,
  mongoUrl: process.env.DATABASEURL,
  MQUrl: process.env.MQURL,
  port: process.env.PORT || "5001",
  clientUrl: process.env.CLIENTURL,
  mqConnection: null,
};
