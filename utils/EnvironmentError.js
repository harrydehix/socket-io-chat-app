module.exports = class EnvironmentError extends Error {
    constructor(message) {
        super(`🤬 [ENVIRONMENT ERROR] 🤬: ${message}!`);

        Error.captureStackTrace(this, this.constructor);
    }
};
