// models/Schedule.js
const mongoose = require('mongoose');

// --- YOUR EXISTING Schedule SCHEMA DEFINITION IS HERE ---
// For example, it might look something like this:
const scheduleSchema = new mongoose.Schema({
    routeOrigin: {
        type: String,
        required: [true, 'Route origin is required.']
    },
    routeDestination: {
        type: String,
        required: [true, 'Route destination is required.']
    },
    departureDateTime: {
        type: Date,
        required: [true, 'Departure date and time are required.']
    },
    arrivalDateTime: {
        type: Date,
        required: [true, 'Arrival date and time are required.']
    },
    vehicle: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vehicle', // Make sure 'Vehicle' matches your vehicle model name
        required: true
    },
    driver: {
        type: mongoose.Schema.ObjectId,
        ref: 'Driver', // Make sure 'Driver' matches your driver model name
        required: true
    },
    farePerSeat: {
        type: Number,
        required: [true, 'Fare per seat is required.']
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Active', 'Completed', 'Cancelled', 'Delayed'],
        default: 'Scheduled'
    },
    isActive: { // You might have this from previous discussions
        type: Boolean,
        default: true
    },
    // --- END OF YOUR EXISTING FIELDS ---

    // +++ ADD THESE NEW FIELDS FOR RATINGS +++
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5'],
        default: 0, // Or null if you prefer. 0 makes calculations easier.
        // Setter to round the average rating to one decimal place (e.g., 4.7)
        set: val => Math.round(val * 10) / 10
    },
    numReviews: {
        type: Number,
        default: 0
    }
    // +++ END OF NEW FIELDS FOR RATINGS +++
}, {
    timestamps: true // If you want createdAt and updatedAt fields automatically
});

// --- ANY OTHER EXISTING SCHEMA METHODS OR HOOKS YOU HAVE ---

const Schedule = mongoose.model('Schedule', scheduleSchema); // Or whatever you named it

module.exports = Schedule;
