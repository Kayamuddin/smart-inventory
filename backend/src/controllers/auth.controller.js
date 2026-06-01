import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/generateToken.js";
import cookie from "cookie-parser"
import env from "../config/env.js";

export const registerController = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) throw new ApiError(400, "All fields are required");

    const isExists = await User.findOne({ email });
    if (isExists) throw new ApiError(409, "User with this email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email, password: hashedPassword });

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