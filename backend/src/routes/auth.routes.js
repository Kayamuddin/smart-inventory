import { loginController, logoutController, refreshTokenController, registerController } from "../controllers/auth.controller.js";
import express from "express";

const authRouter = express.Router();

authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.post("/register", registerController);
authRouter.post("/refresh-token", refreshTokenController);

export default authRouter;