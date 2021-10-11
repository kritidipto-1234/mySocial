function globalErrorHandler(err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "Some unknown error occured";
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
    });
}

module.exports = globalErrorHandler;
