// utils/errorResponse.js

/**
 * @class   ErrorResponse
 * @desc    Custom error class for creating structured error objects with a status code.
 * This helps in sending consistent error responses from the API.
 */
class ErrorResponse extends Error {
    /**
     * @constructor
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code for the error.
     */
    constructor(message, statusCode) {
        super(message); // Call the parent class (Error) constructor with the message
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;