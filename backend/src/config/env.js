import { config } from "dotenv";

config();

const requiredENV = [
  "DATABASE_URI",
  "PORT",
  "NODE_ENV",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "CLIENT_URI",
  "EMAIL_USER",
  "EMAIL_PASS",
];

requiredENV.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is missing in dotenv file`);
  }
});

const env = {
  PORT: process.env.PORT,
  DATABASE_URI: process.env.DATABASE_URI,
  NODE_ENV: process.env.NODE_ENV,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  CLIENT_URI: process.env.CLIENT_URI,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};

export default env;
