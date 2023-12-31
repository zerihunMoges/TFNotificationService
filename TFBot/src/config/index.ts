require("dotenv").config();

export const config = {
  MQUrl: process.env.MQURL,
  apiUrl: process.env.APIURL,
  mongoUrl: process.env.DATABASEURL,
  botToken: process.env.BOTTOKEN,
  updateBotToken: process.env.UPDATEBOTTOKEN,
  port: process.env.PORT || "8001",
  mqConnection: null,
  webAppUrl: process.env.WEBAPPURL,
};
