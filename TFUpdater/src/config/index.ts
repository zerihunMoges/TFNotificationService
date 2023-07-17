require("dotenv").config();
export const config = {
  baseUrl: process.env.BASEURL,
  mongoUrl: process.env.DATABASEURL,
  MQUrl: process.env.MQURL,
};
