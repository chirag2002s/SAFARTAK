// controllers/reviewController.js
const Review = require('../models/Review'); // Adjust path if your models folder is elsewhere
const Booking = require('../models/Booking'); // Adjust path
const Schedule = require('../models/Schedule'); // Adjust path
const Driver = require('../models/Driver'); // Adjust path
const asyncHandler = require('../middleware/asyncHandler'); // Assuming you have an asyncHandler utility
const ErrorResponse = require('../utils/errorResponse'); // Assuming you have an ErrorResponse utility

/**
 * @desc    Create a new review for a booking
 * @route   POST /api/v1/reviews
 * @access  Private (User must be logged in)
 */
exports.createReview = asyncHandler(async (req, res, next) => {
    const { bookingId, rating, comment } = req.body;
    const userId = req.user.id; // Assuming 'protect' middleware adds user to req

    // 1. Validate input
    if (!bookingId || !rating) {
        return next(new ErrorResponse('Please provide bookingId and a rating.', 400));
    }

    // 2. Fetch the booking
    const booking = await Booking.findById(bookingId)
        .populate({
            path: 'schedule',
            select: 'driver' // Only need driver ID from schedule here
        });

    if (!booking) {
        return next(new ErrorResponse(`No booking found with the ID of ${bookingId}`, 404));
    }

    // 3. Check if the logged-in user is the one who made the booking
    if (booking.user.toString() !== userId) {
        return next(new ErrorResponse('You are not authorized to review this booking.', 403));
    }

    // 4. Check if the booking status is 'Completed'
    if (booking.status !== 'Completed') {
        return next(new ErrorResponse('You can only review completed trips.', 400));
    }

    // 5. Check if the user has already reviewed this booking
    const existingReview = await Review.findOne({ booking: bookingId, user: userId });
    if (existingReview) {
        return next(new ErrorResponse('You have already submitted a review for this booking.', 400));
    }

    // 6. Get schedule and driver IDs from the booking
    if (!booking.schedule || !booking.schedule.driver) {
        console.error("Booking details incomplete (missing schedule or driver):", booking);
        return next(new ErrorResponse('Could not find schedule or driver details for this booking.', 500));
    }
    const scheduleId = booking.schedule._id;
    // Handle if driver is populated object or just ID
    const driverId = booking.schedule.driver._id || booking.schedule.driver;

    // 7. Create the review
    const review = await Review.create({
        booking: bookingId,
        user: userId,
        schedule: scheduleId,
        driver: driverId,
        rating,
        comment,
    });

    // The post('save') hook on the Review model will automatically update average ratings.

    res.status(201).json({
        success: true,
        data: review,
        message: 'Review submitted successfully!'
    });
});

// --- *** NEW FUNCTION: Get Reviews *** ---

/**
 * @desc    Get reviews (can be filtered by schedule or driver)
 * @route   GET /api/v1/reviews
 * @route   GET /api/v1/reviews?schedule=scheduleId
 * @route   GET /api/v1/reviews?driver=driverId
 * @access  Public (adjust access control as needed)
 */
exports.getReviews = asyncHandler(async (req, res, next) => {
    let query;

    // Check for specific entity ID in query parameters
    if (req.query.schedule) {
        console.log(`[getReviews] Filtering reviews for schedule: ${req.query.schedule}`);
        query = Review.find({ schedule: req.query.schedule });
    } else if (req.query.driver) {
        console.log(`[getReviews] Filtering reviews for driver: ${req.query.driver}`);
        query = Review.find({ driver: req.query.driver });
    } else {
        // No specific filter - potentially return all reviews (maybe admin only?)
        // Or return reviews by current user if needed elsewhere?
        // For now, let's just return all reviews if no filter specified.
        // Consider adding admin role check here if needed.
        console.log(`[getReviews] Fetching all reviews (no specific filter).`);
        query = Review.find();
    }

    // Populate user details (e.g., name) - select only necessary fields
    query = query.populate({
        path: 'user',
        select: 'name profilePicture' // Adjust fields as needed, e.g., add profilePicture if you have it
    });

    // Add sorting (e.g., newest first)
    query = query.sort({ createdAt: -1 });

    // Add pagination later if needed (using req.query.page, req.query.limit)
    // Example:
    // const page = parseInt(req.query.page, 10) || 1;
    // const limit = parseInt(req.query.limit, 10) || 10;
    // const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;
    // const total = await Review.countDocuments(query.getFilter()); // Count matching documents before pagination
    // query = query.skip(startIndex).limit(limit);
    // const pagination = { currentPage: page, totalPages: Math.ceil(total / limit), totalReviews: total };

    const reviews = await query;

    res.status(200).json({
        success: true,
        count: reviews.length,
        // pagination: pagination, // Include if pagination is implemented
        data: reviews
    });
});


// --- Placeholder for other review controller methods ---

/**
 * @desc    Get a single review by ID
 * @route   GET /api/v1/reviews/:id
 * @access  Public / Private
 */
// exports.getReview = asyncHandler(async (req, res, next) => { ... });

/**
 * @desc    Update a review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private (Owner of the review or Admin)
 */
// exports.updateReview = asyncHandler(async (req, res, next) => { ... });

/**
 * @desc    Delete a review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private (Owner of the review or Admin)
 */
// exports.deleteReview = asyncHandler(async (req, res, next) => { ... });
