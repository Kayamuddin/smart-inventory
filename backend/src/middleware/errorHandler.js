import env from "../config/env.js"

const errorHandler = (error, req, res, next) => {
    res.status(error.statusCode || 500).json({
        message: env.NODE_ENV === "production" ? "Someting went wrong" : error.message
    })
}

export default errorHandler;