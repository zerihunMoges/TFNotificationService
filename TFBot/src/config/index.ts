require("dotenv").config();

export const config = {
  MQUrl: process.env.MQURL,
  baseUrl: process.env.BASEURL,
  mongoUrl: process.env.DATABASEURL,
  botToken: process.env.BOTTOKEN,
};
