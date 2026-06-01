import mongoose from "mongoose";
import env from "./env.js";

const connectDB = async () => {
    try {
        await mongoose.connect(env.DATABASE_URI)
        console.log("Database connected successfully✅");

    } catch (error) {
        throw new Error("DATABASE CONNECTION ERROR: ", error);
    }
}

export default connectDB;