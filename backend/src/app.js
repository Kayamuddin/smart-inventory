import express from "express";
import errorHandler from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import env from "./config/env.js";
import authMiddleware from "./middleware/auth.middleware.js";
import cors from "cors";
import adminRouter from "./routes/admin.routes.js";
import cookieParser from "cookie-parser";
import inventoryRouter from "./routes/inventory.routes.js";
import "./cron/expiryCron.js";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URI || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
if (env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(cookieParser());

app.get("/", authMiddleware, (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/inventory", inventoryRouter);

app.use(errorHandler);

export default app;
