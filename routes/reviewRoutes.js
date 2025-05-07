// routes/reviewRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams is useful if you nest routes like /bookings/:bookingId/reviews

// Import controller methods
const {
    createReview,
    getReviews,       // *** ADD getReviews ***
    // getReview,        // To be implemented later if needed
    // updateReview,     // To be implemented later if needed
    // deleteReview      // To be implemented later if needed
} = require('../controllers/reviewController'); // Adjust path if needed

// Import middleware
const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming you have these

// --- Define Review Routes ---

// Route to create a new review.
router.post('/', protect, createReview);

// Route to get reviews. Can filter by query parameters like ?schedule=scheduleId or ?driver=driverId
// This single route can handle fetching reviews for different entities.
// Access can be public or protected depending on your needs. Let's make it public for now.
router.get('/', getReviews);


// --- Routes for later phases ---

// Route to get, update, and delete a specific review by its ID
// router.route('/:id')
//    .get(getReview)
//    .put(protect, authorize('user', 'admin'), updateReview) // Only review owner or admin can update
//    .delete(protect, authorize('user', 'admin'), deleteReview); // Only review owner or admin can delete


module.exports = router;
