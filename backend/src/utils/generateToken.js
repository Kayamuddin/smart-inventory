import jwt from "jsonwebtoken";
import env from "../config/env.js"
import ApiError from "./ApiError.js";

export function generateAccessToken(userId, userRole) {
    return jwt.sign(
        { id: userId, role: userRole },
        env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" })
}

export function generateRefreshToken(userId, userRole) {
    return jwt.sign(
        { id: userId, role: userRole },
        env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" })
}

export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(
            token,
            env.JWT_ACCESS_SECRET
        );
    } catch (error) {
        throw new ApiError(401, "Access Token is Invalid")
    }
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(
            token,
            env.JWT_REFRESH_SECRET
        );
    } catch (error) {
        throw new ApiError(401, "Refresh Token is Invalid")
    }
};