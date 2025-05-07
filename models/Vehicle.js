// models/Vehicle.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VehicleSchema = new Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Please add a registration number'],
      unique: true, // Each vehicle must have a unique registration number
      trim: true,
      uppercase: true // Store registration numbers in uppercase consistently
    },
    type: {
      type: String,
      required: [true, 'Please add a vehicle type'],
      enum: ['Sedan', 'Ertiga', 'Force Urbania',], // Example types, adjust as needed
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Please add vehicle capacity']
      // Consider adding min/max if appropriate, e.g., min: 4
    },
    features: {
      type: [String], // Array of strings for features
      default: [] // Default to an empty array
      // Example features: 'AC', 'Music System', 'WiFi', 'Charging Ports'
    },
    // Optional fields from your plan:
    currentLocation: { // For potential future tracking
      lat: { type: Number },
      lng: { type: Number }
    },
    // We might add driver assignment later, linking directly might be complex
    // assignedDriver: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'Driver'
    // },
    isActive: { // To easily enable/disable vehicles from service
      type: Boolean,
      default: true
    }
    // Add any other fields relevant to a shuttle vehicle
  },
  {
    timestamps: true // Adds createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.model('Vehicle', VehicleSchema);