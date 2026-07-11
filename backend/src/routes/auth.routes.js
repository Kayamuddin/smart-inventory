import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resetPassword,
  sendRegisterOtp,
  sendResetOtp,
} from "../controllers/auth.controller.js";
import express from "express";
import {
  loginValidation,
  registerValidation,
  resetPasswordValidation,
  sendRegisterOtpValidation,
  sendResetOtpValidation,
} from "../validations/auth.validation.js";
import validationMiddleware from "../middleware/validate.middleware.js";

const authRouter = express.Router();

authRouter.post(
  "/login",
  loginValidation,
  validationMiddleware,
  loginController,
);
authRouter.post("/logout", logoutController);
authRouter.post(
  "/register",
  registerValidation,
  validationMiddleware,
  registerController,
);
authRouter.post("/refresh-token", refreshTokenController);
authRouter.post(
  "/send-reset-otp",
  sendResetOtpValidation,
  validationMiddleware,
  sendResetOtp,
);
authRouter.post(
  "/reset-password",
  resetPasswordValidation,
  validationMiddleware,
  resetPassword,
);
authRouter.post(
  "/send-otp",
  sendRegisterOtpValidation,
  validationMiddleware,
  sendRegisterOtp,
);

export default authRouter;
