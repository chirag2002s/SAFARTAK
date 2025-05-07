// models/Driver.js
const mongoose = require('mongoose');

// --- YOUR EXISTING Driver SCHEMA DEFINITION IS HERE ---
// For example:
const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Driver name is required.']
    },
    phone: {
        type: String,
        required: [true, 'Driver phone number is required.'],
        unique: true // Example
    },
    licenseNumber: {
        type: String,
        required: [true, 'Driver license number is required.'],
        unique: true // Example
    },
    vehicleAssigned: { // Example field
        type: mongoose.Schema.ObjectId,
        ref: 'Vehicle'
    },
    // --- END OF YOUR EXISTING FIELDS ---

    // +++ ADD THESE NEW FIELDS FOR RATINGS +++
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5'],
        default: 0, // Or null
        set: val => Math.round(val * 10) / 10 // Rounds to one decimal place
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

const Driver = mongoose.model('Driver', driverSchema); // Or whatever you named it

module.exports = Driver;
