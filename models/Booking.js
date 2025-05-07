// models/Booking.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Reusable schema for location (minor improvement: make lat/lng optional by not setting required)
const LocationSchema = new Schema({
  address: { type: String, required: [true, 'Location address is required.'], trim: true },
  lat: { type: Number }, // Optional latitude
  lng: { type: Number }  // Optional longitude
}, { _id: false }); // Don't create separate _id for location subdocuments

const BookingSchema = new Schema(
  {
    user: { // User who made the booking
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true // Index for easily finding user's bookings
    },
    // --- Changed Vehicle/Driver to reference Schedule ---
    // Vehicle and Driver should ideally be linked via the Schedule
    // The booking references the specific schedule instance
    schedule: {
        type: mongoose.Schema.ObjectId,
        ref: 'Schedule', // Reference the Schedule model
        required: [true, 'A schedule must be selected for the booking.'],
        index: true
    },
    // --- Removed direct vehicle/driver refs from Booking ---
    // vehicle: { ... },
    // driver: { ... },

    // --- Removed pickup/dropoff/travelDateTime as they come from Schedule ---
    // pickupLocation: { ... },
    // dropLocation: { ... },
    // travelDateTime: { ... },

    // --- Renamed passengers to numberOfSeats for clarity ---
    numberOfSeats: { // Changed from 'passengers'
      type: Number,
      required: [true, 'Please specify number of seats'],
      min: [1, 'Must book at least 1 seat'],
      // Max validation might be better handled against schedule.vehicle.capacity during booking creation
      // max: [7, 'Maximum 7 passengers allowed per booking']
    },
    fare: { // Calculated fare for this specific booking (per seat * numberOfSeats?)
      type: Number,
      required: [true, 'Booking fare is required.'], // Fare should be calculated before saving
      min: [0, 'Fare cannot be negative.'] // Allow 0 fare if applicable
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true // Index for querying bookings by status
    },
    paymentMethod: { // How the user intends to pay or paid
      type: String,
      enum: ['Online', 'Cash'], // Removed empty string, should be decided at booking time
      required: [true, 'Payment method is required.']
    },
    paymentStatus: { // Status of the payment itself
      type: String,
      required: true,
      enum: ['Pending', 'Success', 'Failed', 'Refunded'], // Added Refunded
      default: 'Pending'
    },
    paymentId: { // ID from the payment gateway transaction (if online)
      type: String,
      required: false, // Only required if paymentMethod is 'Online' and successful?
      trim: true,
      index: true // Index if you need to search by paymentId
    }
    // Add other booking details if needed (e.g., special requests, luggage info)
    // specialRequests: { type: String, trim: true }
  },
  {
    timestamps: true // Adds createdAt (booking creation time) and updatedAt
  }
);

// --- Potential Enhancements ---

// 1. Pre-save validation: Check if numberOfSeats exceeds available seats on the schedule?
// BookingSchema.pre('save', async function(next) {
//   if (this.isNew) { // Only run on creation
//     try {
//       const Schedule = mongoose.model('Schedule'); // Get Schedule model
//       const schedule = await Schedule.findById(this.schedule).populate('vehicle');
//       if (!schedule || !schedule.vehicle) {
//         return next(new Error('Associated schedule or vehicle not found.'));
//       }
//       // Need logic here to calculate currently booked seats for this schedule
//       // This is complex as it requires querying other bookings for the same schedule
//       // const bookedSeats = await mongoose.model('Booking').countDocuments({ schedule: this.schedule, status: { $nin: ['Cancelled'] } });
//       // if (bookedSeats + this.numberOfSeats > schedule.vehicle.capacity) {
//       //   return next(new Error(`Not enough seats available. Only ${schedule.vehicle.capacity - bookedSeats} left.`));
//       // }
//     } catch (error) {
//       return next(error);
//     }
//   }
//   next();
// });


module.exports = mongoose.model('Booking', BookingSchema);
