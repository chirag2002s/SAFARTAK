// middleware/errorHandler.js
const ErrorResponse = require('../utils/errorResponse'); // Import your custom ErrorResponse class

const errorHandler = (err, req, res, next) => {
    let error = { ...err }; // Create a copy of the error object

    error.message = err.message; // Copy the message

    // Log the error to the console for the developer
    console.error('--- ERROR ---'.red); // Optional: Use colors package
    console.error(err.stack || err); // Log the full stack trace or the error object
    console.error('-------------'.red);

    // Mongoose Bad ObjectId Error
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404); // Set as 404 Not Found
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        // Extract the field that caused the duplicate error
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        const message = `Duplicate field value entered: '${value}' for field '${field}'. Please use another value.`;
        error = new ErrorResponse(message, 400); // Set as 400 Bad Request
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        // Extract messages from all validation errors
        const messages = Object.values(err.errors).map(val => val.message);
        const message = `Invalid input data. ${messages.join('. ')}`;
        error = new ErrorResponse(message, 400); // Set as 400 Bad Request
    }

    // Handle other specific errors by name if needed
    // if (err.name === 'JsonWebTokenError') { ... }
    // if (err.name === 'TokenExpiredError') { ... }


    // Send the final JSON error response
    res.status(error.statusCode || 500).json({
        success: false,
        // Use the message from the processed error object, or a default server error message
        message: error.message || 'Server Error'
        // Optionally, you might want to send the error stack only in development mode
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
