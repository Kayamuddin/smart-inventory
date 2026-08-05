import env from "../config/env.js";

const errorHandler = (error, req, res, next) => {
  const shouldLog =
    env.NODE_ENV !== "production" &&
    error.name !== "TokenExpiredError" &&
    error.name !== "JsonWebTokenError";

  if (shouldLog) {
    console.error(error);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message:
      env.NODE_ENV === "production" ? "Someting went wrong" : error.message,
  });
};

export default errorHandler;
