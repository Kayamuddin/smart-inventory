import { loginController, logoutController, refreshTokenController, registerController, resetPassword, sendRegisterOtp, sendResetOtp } from "../controllers/auth.controller.js";
import express from "express";

const authRouter = express.Router();

authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.post("/register", registerController);
authRouter.post("/refresh-token", refreshTokenController);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/send-otp", sendRegisterOtp);

export default authRouter;