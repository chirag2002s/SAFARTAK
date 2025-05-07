// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    booking: { // Link to the specific booking the review is for
        type: mongoose.Schema.ObjectId,
        ref: 'Booking', // Make sure 'Booking' matches your booking model name
        required: [true, 'Review must belong to a booking.'],
    },
    user: { // The user who wrote the review
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Make sure 'User' matches your user model name
        required: [true, 'Review must belong to a user.'],
    },
    schedule: { // The schedule that was reviewed
        type: mongoose.Schema.ObjectId,
        ref: 'Schedule', // Make sure 'Schedule' matches your schedule model name
        required: [true, 'Review must be for a specific schedule.'],
    },
    driver: { // The driver of the schedule
        type: mongoose.Schema.ObjectId,
        ref: 'Driver', // Make sure 'Driver' matches your driver model name
        required: [true, 'Review must be associated with a driver.'],
    },
    rating: { // Numerical rating, e.g., 1 to 5 stars
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please provide a rating between 1 and 5 stars.'],
    },
    comment: { // Textual review content
        type: String,
        trim: true,
        maxlength: [500, 'Review comment cannot be more than 500 characters.'],
        // Comment is not strictly required, users might just want to leave a star rating
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // You could add more fields later, like:
    // isApproved: { type: Boolean, default: true } // For admin moderation
});

// Compound index to ensure a user can only review a specific booking once
reviewSchema.index({ booking: 1, user: 1 }, { unique: true });

// Static method to calculate the average rating for an entity (Schedule or Driver)
reviewSchema.statics.calculateAverageRating = async function(entityId, entityModelName) {
    console.log(`Calculating average rating for ${entityModelName} ID: ${entityId}`);
    const stats = await this.aggregate([
        {
            $match: { [entityModelName.toLowerCase()]: entityId } // Dynamically match based on entityModelName
        },
        {
            $group: {
                _id: `$${entityModelName.toLowerCase()}`,
                numReviews: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    console.log(`Stats for ${entityModelName} ID ${entityId}:`, stats);

    try {
        const Model = mongoose.model(entityModelName); // Get the actual Mongoose model
        if (stats.length > 0) {
            await Model.findByIdAndUpdate(entityId, {
                numReviews: stats[0].numReviews,
                averageRating: stats[0].avgRating
            });
            console.log(`Updated average rating for ${entityModelName} ID ${entityId}`);
        } else {
            // If there are no reviews left (e.g., all deleted), reset to default values
            await Model.findByIdAndUpdate(entityId, {
                numReviews: 0,
                averageRating: 0 // Or null, or your preferred default (e.g., 0 or 4 if you want a higher default)
            });
            console.log(`Reset average rating for ${entityModelName} ID ${entityId} as no reviews found.`);
        }
    } catch (err) {
        console.error(`Error updating average rating for ${entityModelName} ${entityId}:`, err);
    }
};

// Mongoose middleware (hook) to call calculateAverageRating after a new review is saved
reviewSchema.post('save', async function() {
    // 'this' points to the current review document that was saved
    // 'this.constructor' points to the Review model
    // We pass the ID of the schedule/driver and the name of the model ('Schedule' or 'Driver')
    await this.constructor.calculateAverageRating(this.schedule, 'Schedule');
    await this.constructor.calculateAverageRating(this.driver, 'Driver');
});

// Mongoose middleware (hook) to call calculateAverageRating when a review is removed
// Important: This hook triggers for document middleware like `doc.remove()`.
// If you use query middleware like `Review.findByIdAndDelete()`, this hook won't run.
// In that case, you'd call calculateAverageRating manually in your delete controller.
// For simplicity with `doc.remove()`, we use `post('remove')`.
reviewSchema.post('remove', async function() {
    // 'this' points to the review document that was removed
    await this.constructor.calculateAverageRating(this.schedule, 'Schedule');
    await this.constructor.calculateAverageRating(this.driver, 'Driver');
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
