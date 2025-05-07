// models/Otp.js (Example Structure)
const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
    },
    hashedOtp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        // Example: Automatically delete after expiry using TTL index
        // index: { expires: '10m' } // Adjust expiry time as needed (e.g., 10 minutes)
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Optional: Create index for faster lookups and potentially for TTL deletion
OtpSchema.index({ phoneNumber: 1 });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Alternative TTL setup

module.exports = mongoose.model('Otp', OtpSchema);