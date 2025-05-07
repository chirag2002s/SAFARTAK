// routes/schedules.js
const express = require('express');
console.log('--- Loading routes/schedules.js ---');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Schedule = require('../models/Schedule');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const Review = require('../models/Review'); // Import Review if needed for direct queries here
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// --- POST /api/schedules (Create Schedule - Admin) ---
router.post('/', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
    // ... (your existing create schedule logic)
    // Ensure new schedules have default averageRating: 0, numReviews: 0
    console.log("Creating schedule with body:", req.body); // Log request body
    const newSchedule = await Schedule.create(req.body); // Simplified example
    console.log("Schedule created:", newSchedule._id);
    res.status(201).json({ success: true, data: newSchedule });
}));

/**
 * @route   GET /api/schedules/search
 * @desc    Find available schedules based on origin, destination, and date
 * @access  Private (Requires user token)
 */
router.get('/search', protect, asyncHandler(async (req, res, next) => {
    console.log('[Search Route] Raw req.query:', req.query);
    const { origin, destination, date } = req.query;
    console.log(`[Search Route] Destructured values: origin=${origin}, destination=${destination}, date=${date}`);

    if (!origin || !destination || !date) {
        return next(new ErrorResponse('Origin, destination, and date are required.', 400));
    }
    let travelDate;
    try {
        travelDate = new Date(date + 'T00:00:00.000Z');
        if (isNaN(travelDate.getTime())) throw new Error('Invalid date value');
    } catch (e) {
        return next(new ErrorResponse(`Invalid date format: ${date}. Please use YYYY-MM-DD.`, 400));
    }
    const startDate = travelDate;
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 1);

    console.log(`[Search Route] Date Range (UTC): ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const filterCriteria = {
        routeOrigin: { $regex: new RegExp(origin, 'i') },
        routeDestination: { $regex: new RegExp(destination, 'i') },
        departureDateTime: { $gte: startDate, $lt: endDate },
        status: 'Scheduled',
        // isActive: true, // Keep commented if your data doesn't have isActive: true
    };
    console.log('[Search Route] Executing Schedule query with filter:', JSON.stringify(filterCriteria, null, 2));

    // Find Schedules. Mongoose includes all schema fields by default,
    // including averageRating and numReviews.
    const schedules = await Schedule.find(filterCriteria)
        .populate('vehicle', 'model registrationNumber capacity type') // Populate vehicle details
        .populate('driver', 'name phone averageRating numReviews') // Optionally populate driver rating too
        .sort({ departureDateTime: 1 })
        .lean(); // Use .lean() for faster queries and plain objects

    console.log(`[Search Route] Found ${schedules.length} schedules raw (includes rating fields if they exist).`);

    if (schedules.length === 0) {
        console.log("[Search Route] No schedules found. Returning empty array.");
        return res.status(200).json({ success: true, count: 0, data: [] });
    }

    // Calculate available seats (Optimized)
    const scheduleIds = schedules.map(s => s._id);

    // Fetch relevant bookings to calculate availability
    const bookingsForAvailability = await Booking.find({
        schedule: { $in: scheduleIds },
        status: { $nin: ['Cancelled', 'Failed'] }
    }).select('schedule seats'); // Select only necessary fields

    // Create maps for efficient lookup
    const bookedSeatsMap = scheduleIds.reduce((map, id) => { map[id.toString()] = new Set(); return map; }, {});

    bookingsForAvailability.forEach(booking => {
        const scheduleIdStr = booking.schedule.toString();
        if (Array.isArray(booking.seats)) {
            booking.seats.forEach((seatId) => {
                if (bookedSeatsMap[scheduleIdStr]) {
                     bookedSeatsMap[scheduleIdStr].add(seatId);
                }
            });
        }
    });

    // Map results and add availability
    const schedulesWithAvailability = schedules.map(schedule => {
        const scheduleIdStr = schedule._id.toString();
        const totalCapacity = schedule.vehicle?.capacity || 0;
        const bookedCount = bookedSeatsMap[scheduleIdStr]?.size || 0;
        const availableSeats = totalCapacity - bookedCount;

        // The 'schedule' object here already contains all fields from the database query,
        // including averageRating and numReviews (if they exist on the document).
        // We just spread it and add the calculated availability.
        return {
            ...schedule, // Includes averageRating, numReviews, etc.
            availableSeats: availableSeats > 0 ? availableSeats : 0,
            totalCapacity: totalCapacity,
        };
    });

    console.log(`[Search Route] Returning ${schedulesWithAvailability.length} schedules with availability and rating info.`);
    res.status(200).json({
        success: true,
        count: schedulesWithAvailability.length,
        data: schedulesWithAvailability // This data includes rating fields
    });
}));


// --- GET /api/schedules/:scheduleId/seats (Seat Layout Logic) ---
router.get('/:scheduleId/seats', protect, asyncHandler(async (req, res, next) => {
    // ... (Keep the existing get seats logic exactly as it was) ...
     const { scheduleId } = req.params;
     console.log(`[GET /:scheduleId/seats] Request for schedule: ${scheduleId}`);
     if (!mongoose.Types.ObjectId.isValid(scheduleId)) { return next(new ErrorResponse('Invalid Schedule ID format.', 400)); }
     const schedule = await Schedule.findById(scheduleId).populate('vehicle', 'capacity');
     if (!schedule || !schedule.vehicle) { return next(new ErrorResponse('Schedule or associated vehicle not found.', 404)); }
     const activeBookings = await Booking.find({ schedule: scheduleId, status: { $nin: ['Cancelled', 'Failed'] } }).select('seats passengerDetails');
     let bookedSeatNumbers = [];
     let femaleBookedSeatNumbers = new Set();
     activeBookings.forEach(booking => {
         if (Array.isArray(booking.seats)) {
             bookedSeatNumbers = bookedSeatNumbers.concat(booking.seats);
             if (Array.isArray(booking.passengerDetails) && booking.passengerDetails.length === booking.seats.length) {
                 booking.seats.forEach((seatNum, index) => {
                     if (booking.passengerDetails[index]?.gender === 'Female') { femaleBookedSeatNumbers.add(seatNum); }
                 });
             }
         }
     });
     const bookedSeatSet = new Set(bookedSeatNumbers);
     const baseLayout = [ /* ... Your seat layout definition ... */
          { id: 'P1', number: 'P1', isFemaleOnly: false }, { id: 'D', number: 'D', status: 'driver' },
          { id: 'P2', number: 'P2', isFemaleOnly: false }, { id: 'P3', number: 'P3', isFemaleOnly: false }, { id: 'P4', number: 'P4', isFemaleOnly: true },
          { id: 'P5', number: 'P5', isFemaleOnly: false }, { id: 'P6', number: 'P6', isFemaleOnly: false },
     ];
     const finalSeatLayout = baseLayout.map(seat => {
         if (seat.status === 'driver') return seat;
         const isBooked = bookedSeatSet.has(seat.number);
         const isBookedByFemale = femaleBookedSeatNumbers.has(seat.number);
         let status = isBooked ? 'booked' : 'available';
         let finalIsFemaleOnly = (!isBooked && seat.isFemaleOnly) || isBookedByFemale;
         return { ...seat, status, isFemaleOnly: finalIsFemaleOnly };
     });
     res.status(200).json({ success: true, data: finalSeatLayout });
}));

// --- Export the router ---
module.exports = router;
    