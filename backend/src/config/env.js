import { config } from "dotenv";

config();

const requiredENV = ["DATABASE_URI", "PORT", "NODE_ENV", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

requiredENV.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`${key} is missing in dotenv file`);
    }
})

const env = {
    PORT: process.env.PORT,
    DATABASE_URI: process.env.DATABASE_URI,
    NODE_ENV: process.env.NODE_ENV,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
}

export default env;