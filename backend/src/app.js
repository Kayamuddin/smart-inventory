import express from "express";
import errorHandler from "./middleware/errorHandler.js"
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import env from "./config/env.js";
import authMiddleware from "./middleware/auth.middleware.js";

const app = express();

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