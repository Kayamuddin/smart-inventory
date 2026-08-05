import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/generateToken.js";
import cookie from "cookie-parser";
import env from "../config/env.js";
import sendEmail from "../utils/sendEmail.js";
import Otp from "../models/Otp.model.js";

export const registerController = async (req, res, next) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp)
      throw new ApiError(400, "All fields are required");
    if (otp.length !== 6) throw new ApiError(400, "OTP must be 6 digits");

    const existingOtp = await Otp.findOne({ email });

    if (!existingOtp) throw new ApiError(400, "OTP expired or not found");

    const isOtpMatch = await bcrypt.compare(otp, existingOtp.otp);
    if (!isOtpMatch) throw new ApiError(400, "Invalid OTP");

    const isExists = await User.findOne({ email });
    if (isExists)
      throw new ApiError(409, "User with this email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    await Otp.deleteOne({ email });

    const accessToken = generateAccessToken(newUser._id, newUser.role);
    const refreshToken = generateRefreshToken(newUser._id, newUser.role);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      data: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw new ApiError(400, "All fields are required");

    const user = await User.findOne({ email });

    if (!user) throw new ApiError(404, "User not found");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new ApiError(401, "Invalid credentials");

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
      message: "User logged in successfully",
      success: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) throw new ApiError(400, "No refresh token provided");

    const user = await User.findOne({ refreshToken: refreshToken });

    if (!user) throw new ApiError(404, "User not found");

    user.refreshToken = undefined;
    await user.save();

    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "User logged out successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) throw new ApiError(401, "Refresh token missing");

    let decoded;

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, "Invalid refresh token");
    }

    const user = await User.findById(decoded.id);

    if (!user) throw new ApiError(401, "User not found");

    if (user.refreshToken !== refreshToken)
      throw new ApiError(401, "Refresh token mismatch");

    const newAccessToken = generateAccessToken(user._id, user.role);

    const newRefreshToken = generateRefreshToken(user._id, user.role);

    // Refresh Token Rotation
    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const sendResetOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;

    // 5 min expiry
    user.resetOtpExpire = Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendEmail(
      email,
      "Password Reset Verification Code",
      `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333;">
          <h2 style="margin-bottom: 16px;">Password Reset Request</h2>

          <p>Hello,</p>

          <p>
            We received a request to reset the password for your account.
            Please use the verification code below to continue:
          </p>

          <div style="margin: 24px 0; text-align: center;">
            <span style="display: inline-block; padding: 14px 28px; font-size: 28px; font-weight: bold; letter-spacing: 6px; background: #f4f4f4; border-radius: 8px;">
              ${otp}
            </span>
          </div>

          <p>
            This code will expire in <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not request a password reset, you can safely ignore this email.
            Your account will remain secure.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />

          <p style="font-size: 13px; color: #777;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `,
    );

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Check OTP
    if (user.resetOtp !== otp) {
      throw new ApiError(400, "Invalid OTP");
    }

    // Check expiry
    if (user.resetOtpExpire < Date.now()) {
      throw new ApiError(400, "OTP expired");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    // Clear OTP
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};

export const sendRegisterOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.findOneAndUpdate(
      { email },
      {
        otp: hashedOtp,

        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },

      {
        upsert: true, // if docs with email doesn't exist, create new
        returnDocument: "after",
      },
    );

    await sendEmail(
      email,
      "Verify Your Email Address",
      `
        <div style="max-width:600px;margin:0 auto;padding:32px;font-family:Arial,Helvetica,sans-serif;background:#ffffff;color:#333;">
          <h2 style="margin-bottom:20px;color:#2563eb;">Welcome!</h2>

          <p>Hello,</p>

          <p>
            Thank you for registering. To complete the creation of your account,
            please verify your email address using the verification code below:
          </p>

          <div style="margin:30px 0;text-align:center;">
            <span style="display:inline-block;padding:16px 32px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:8px;font-size:32px;font-weight:bold;letter-spacing:8px;">
              ${otp}
            </span>
          </div>

          <p>
            <strong>This verification code is valid for 10 minutes.</strong>
          </p>

          <p>
            If you did not create an account using this email address, you can safely
            ignore this message. No account will be activated without verification.
          </p>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;" />

          <p style="font-size:12px;color:#6b7280;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `,
    );

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};
