import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/generateToken.js";
import cookie from "cookie-parser"
import env from "../config/env.js";
import sendEmail from "../utils/sendEmail.js";
import Otp from "../models/Otp.model.js";

export const registerController = async (req, res) => {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) throw new ApiError(400, "All fields are required");
    if (otp.length !== 6) throw new ApiError(400, "OTP must be 6 digits");

    const existingOtp = await Otp.findOne({ email });

    if (!existingOtp) throw new ApiError(400, "OTP expired or not found");

    const isOtpMatch = await bcrypt.compare(otp, existingOtp.otp);
    if (!isOtpMatch) throw new ApiError(400, "Invalid OTP");

    const isExists = await User.findOne({ email });
    if (isExists) throw new ApiError(409, "User with this email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email, password: hashedPassword });

    await Otp.deleteOne({ email });

    const accessToken = generateAccessToken(
        newUser._id,
        newUser.roles
    );
    const refreshToken = generateRefreshToken(
        newUser._id,
        newUser.roles
    );

    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7
    })

    res.status(201).json({
        message: "User registered successfully",
        success: true,
        data: {
            name: newUser.name,
            email: newUser.email,
            roles: newUser.roles
        },
        token: accessToken
    });
}

export const loginController = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) throw new ApiError(400, "All fields are required");

    const user = await User.findOne({ email });

    if (!user) throw new ApiError(404, "User not found");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new ApiError(401, "Invalid credentials");

    const accessToken = generateAccessToken(
        user._id,
        user.roles
    );
    const refreshToken = generateRefreshToken(
        user._id,
        user.roles
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7
    })

    res.status(200).json({
        message: "User logged in successfully",
        success: true,
        data: {
            name: user.name,
            email: user.email,
            roles: user.roles
        },
        token: accessToken
    });
}

export const logoutController = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) throw new ApiError(400, "No refresh token provided");

    const user = await User.findOne({ refreshToken: refreshToken });

    if (!user) throw new ApiError(404, "User not found");

    user.refreshToken = undefined;
    await user.save();

    res.clearCookie("refreshToken");

    res.status(200).json({
        message: "User logged out successfully",
        success: true
    });
}

export const refreshTokenController = async (req, res) => {
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

    if (user.refreshToken !== refreshToken) throw new ApiError(401, "Refresh token mismatch");

    const newAccessToken = generateAccessToken(
        user._id,
        user.roles
    );

    const newRefreshToken = generateRefreshToken(
        user._id,
        user.roles
    );

    // Refresh Token Rotation
    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        token: newAccessToken
    });
};

export const sendResetOtp = async (req, res) => {
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
        "Password Reset OTP",
        `Your OTP is ${otp}`
    );

    res.json({
        success: true,
        message: "OTP sent successfully"
    });
}

export const resetPassword = async (req, res) => {
    const {
        email,
        otp,
        newPassword
    } = req.body;

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
        message: "Password reset successful"
    });
};

export const sendRegisterOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const otp = Math.floor(
        100000 +
        Math.random() * 900000
    ).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.findOneAndUpdate(
        { email },
        {
            otp: hashedOtp,

            expiresAt:
                new Date(
                    Date.now() +
                    10 *
                    60 *
                    1000
                ),
        },

        {
            upsert: true,  // if docs with email doesn't exist, create new
            new: true,
        }
    );

    await sendEmail(
        email,
        "Password Reset OTP",
        `Your OTP is ${otp}`
    );

    res.status(200).json({
        success: true,
        message:
            "OTP sent successfully",
    });
};