import { validationResult } from "express-validator";
import env from "../config/env.js";

const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = errors.array()[0];
    env.NODE_ENV !== "production" && console.error("Validation error:", error);
    return res.status(400).json({
      success: false,
      message: error.msg || "Validation failed",
      field: error.path,
    });
  }

  next();
};

export default validationMiddleware;
