class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = "failed";
    }
}

module.exports = AppError;
