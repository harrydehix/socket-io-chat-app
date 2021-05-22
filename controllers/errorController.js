const util = require("util");
const AppError = require("../utils/AppError");

// In development mode all error details are sent to the client (if they happen in the req-res-cycle)
function sendErrorDevelopment(err, res) {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
    });
}

// In production mode only trusted errors are sent to the client, others details get hidden and are only printed to the console
function sendErrorProduction(err, res) {
    if (err.isOperational) {
        // Operational, trusted error
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Programming/unknown error (don't leak details)
        console.error(`[ERROR]:\t ${util.inspect(err)}`);
        res.status(500).json({
            status: "error",
            message: "Something went wrong...",
        });
    }
}

function handleDBCastError(err) {
    const message = `Invalid ${err.path}: '${err.value}'`;
    return new AppError(message, 400);
}

function handleDBDuplicateError(err) {
    const values = Object.values(err.keyValue).join(", ");
    const message = `Duplicate field value(s): ${values}. Please try different value(s)!`;
    return new AppError(message, 400);
}

function handleDBValidationError(err) {
    const errors = Object.values(err.errors)
        .map((error) => error.message)
        .join(". ");
    const message = `Invalid input data: ${errors}`;
    return new AppError(message, 400);
}

function handleJWTError() {
    return new AppError("Invalid token. Please try again!", 401);
}

function handleJWTExpiredError() {
    return new AppError("Token expired. Please try again!", 401);
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        console.error(err);
        sendErrorDevelopment(err, res);
    } else {
        let error = { ...err, message: err.message };

        if (err.name === "CastError") {
            error = handleDBCastError(err);
        } else if (err.name === "MongoError" && err.code === 11000) {
            error = handleDBDuplicateError(err);
        } else if (err.name === "ValidationError") {
            error = handleDBValidationError(err);
        } else if (err.name === "JsonWebTokenError") {
            error = handleJWTError();
        } else if (err.name === "TokenExpiredError") {
            error = handleJWTExpiredError();
        }
        sendErrorProduction(error, res);
    }
};
