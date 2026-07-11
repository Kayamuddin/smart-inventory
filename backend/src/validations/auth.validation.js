import { body } from "express-validator";

const emailValidation = body("email")
  .trim()
  .notEmpty()
  .withMessage("Email is required")
  .isEmail()
  .withMessage("Please enter a valid email")
  .normalizeEmail();

const passwordValidation = body("password")
  .notEmpty()
  .withMessage("Password is required")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password must contain at least one lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Password must contain at least one number")
  .matches(/[!@#$%^&*(),.?":{}|<>]/)
  .withMessage("Password must contain at least one special character");

const otpValidation = body("otp")
  .trim()
  .notEmpty()
  .withMessage("OTP is required")
  .isLength({ min: 6, max: 6 })
  .withMessage("OTP must be exactly 6 digits")
  .isNumeric()
  .withMessage("OTP must contain only numbers");

export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters"),

  emailValidation,

  passwordValidation,

  otpValidation,
];

export const loginValidation = [
  emailValidation,
  body("password").notEmpty().withMessage("Password is required"),
];

export const sendRegisterOtpValidation = [emailValidation];

export const sendResetOtpValidation = [emailValidation];

export const resetPasswordValidation = [
  emailValidation,

  otpValidation,

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character"),
];
