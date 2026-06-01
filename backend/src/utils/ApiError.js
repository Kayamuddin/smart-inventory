class ApiError extends Error {
    constructor(statusCode = 500, message = "Server Error") {
        super(message);
        this.statusCode = statusCode;
        this.success = false
    }
}

export default ApiError;