import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";
import { verifyAccessToken } from "../utils/generateToken.js";

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(401, "Authorization token missing");
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select("-password -refreshToken -resetOtp -resetOtpExpiry");

    if (!user) throw new ApiError(401, "User no longer exists");

    req.user = user;

    next();
}

export default authMiddleware;