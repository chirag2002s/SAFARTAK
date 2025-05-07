// middleware/asyncHandler.js

/**
 * @desc    Utility function to wrap asynchronous route handlers.
 * It catches errors from async functions and passes them to the next error-handling middleware.
 * @param   {Function} fn - The asynchronous route handler function.
 * @returns {Function} A new function that executes the route handler and catches errors.
 */
const asyncHandler = fn => (req, res, next) =>
    Promise
        .resolve(fn(req, res, next))
        .catch(next); // Pass any caught errors to Express's error handler

module.exports = asyncHandler;
