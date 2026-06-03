import express from "express";
import errorHandler from "./middleware/errorHandler.js"
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import env from "./config/env.js";
import authMiddleware from "./middleware/auth.middleware.js";
import cors from "cors";

const app = express();

app.use(cors({
    origin: env.CLIENT_URI || "http://localhost:5173",
}))

app.use(express.json());
if (env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

app.get("/", authMiddleware, (req, res) => {
    res.send("Server is running");
});

app.use("/api/auth", authRouter)

app.use(errorHandler)

export default app;