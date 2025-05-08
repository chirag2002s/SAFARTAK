// routes/bookings.js
const express = require('express');
console.log('--- Loading routes/bookings.js ---');
const router = express.Router();
const Booking = require('../models/Booking'); // Use YOUR Booking model
const Schedule = require('../models/Schedule'); // Need Schedule for validation/population
const Vehicle = require('../models/Vehicle'); // Need Vehicle for population
const Driver = require('../models/Driver');   // Needed for population
const Review = require('../models/Review'); // Import Review model
const { protect } = require('../middleware/authMiddleware'); // Auth middleware
const mongoose = require('mongoose');
const crypto = require('crypto'); // Needed for verification
const asyncHandler = require('../middleware/asyncHandler'); // Assuming you have this utility
const ErrorResponse = require('../utils/errorResponse');   // Assuming you have this utility

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking (Handles Cash OR Online Payment Verification)
 * @access  Private (User)
 */
console.log('--- Defining POST /api/bookings route handler ---');
router.post(
    '/',
    protect, // Only logged-in users can book
    asyncHandler(async (req, res, next) => { // Wrapped with asyncHandler
        console.log('*** POST /api/bookings handler reached! ***');
        console.log("Received booking request body:", req.body);

        const {
            schedule: scheduleId, numberOfSeats, fare, paymentMethod, passengerDetails,
            contactDetails, selectedSeatNumbers, boardingPointId, deboardingPointId,
            razorpay_order_id, razorpay_payment_id, razorpay_signature
        } = req.body;

        // --- Basic Input Validation ---
        if (!scheduleId || !mongoose.Types.ObjectId.isValid(scheduleId) || !numberOfSeats || !selectedSeatNumbers || !Array.isArray(selectedSeatNumbers) || selectedSeatNumbers.length === 0 || fare === undefined || fare === null || !paymentMethod || !passengerDetails || !contactDetails || !boardingPointId || !deboardingPointId ) {
            return next(new ErrorResponse('Missing required booking information (schedule, seats, fare, payment, passenger/contact details, points).', 400));
        }
        if (isNaN(parseInt(numberOfSeats)) || parseInt(numberOfSeats) <= 0 || parseInt(numberOfSeats) !== selectedSeatNumbers.length) {
            return next(new ErrorResponse('Number of seats does not match selected seats.', 400));
        }
        // Ensure fare is a valid number before parsing
        if (isNaN(parseFloat(fare)) || parseFloat(fare) < 0) {
            return next(new ErrorResponse('Invalid fare amount.', 400));
        }

        // --- Prepare Base Booking Data ---
        const newBookingData = {
            user: req.user.id,
            schedule: scheduleId,
            numberOfSeats: parseInt(numberOfSeats),
            seats: selectedSeatNumbers, // Assuming schema uses 'seats'
            passengerDetails: passengerDetails,
            contactDetails: contactDetails,
            boardingPointId: boardingPointId,
            deboardingPointId: deboardingPointId,
            // *** CORRECTED: Use 'fare' to match the required schema field ***
            fare: parseFloat(fare),
            // ***************************************************************
            paymentMethod: paymentMethod,
            // Status and paymentStatus will default or be set below
        };

        // --- Validate Schedule and Seat Availability ---
        const schedule = await Schedule.findById(scheduleId).populate('vehicle', 'capacity');
        if (!schedule) {
            console.error(`Schedule not found inside POST /api/bookings for ID: ${scheduleId}`);
            return next(new ErrorResponse('Selected schedule not found.', 404));
        }
        if (schedule.status !== 'Scheduled') { return next(new ErrorResponse(`Cannot book schedule with status: ${schedule.status}`, 400)); }
        if (!schedule.vehicle) { return next(new ErrorResponse('Vehicle details missing for schedule.', 400)); }

        const bookedSeatsResult = await Booking.aggregate([
            { $match: { schedule: new mongoose.Types.ObjectId(scheduleId), status: { $nin: ['Cancelled', 'Failed'] } } },
            { $unwind: '$seats' },
            { $group: { _id: null, bookedSeatList: { $addToSet: '$seats' } } }
        ]);
        const bookedSeatSet = new Set(bookedSeatsResult.length > 0 ? bookedSeatsResult[0].bookedSeatList : []);
        const capacity = schedule.vehicle.capacity || 0;
        const availableCount = capacity - bookedSeatSet.size;

        if (parseInt(numberOfSeats) > availableCount) { return next(new ErrorResponse(`Not enough seats available. Only ${availableCount} left.`, 400)); }
        const conflict = selectedSeatNumbers.some(seat => bookedSeatSet.has(seat));
        if (conflict) { return next(new ErrorResponse('One or more selected seats are no longer available. Please select different seats.', 409)); }

        // --- Handle Payment ---
        if (paymentMethod === 'Online') {
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) { return next(new ErrorResponse('Missing Razorpay payment details for online payment.', 400)); }
            const secret = process.env.RAZORPAY_KEY_SECRET;
            if (!secret) { console.error("RAZORPAY_KEY_SECRET not configured."); return next(new ErrorResponse('Payment processing configuration error.', 500)); }
            const bodyString = `${razorpay_order_id}|${razorpay_payment_id}`;
            const expectedSignature = crypto.createHmac('sha256', secret).update(bodyString).digest('hex');
            if (expectedSignature === razorpay_signature) {
                console.log(`Signature verified for order ${razorpay_order_id}`);
                newBookingData.paymentStatus = 'Success';
                newBookingData.paymentId = razorpay_payment_id;
                newBookingData.status = 'Confirmed';
            } else { console.warn(`Signature verification failed for order ${razorpay_order_id}`); return next(new ErrorResponse('Invalid payment signature.', 400)); }
        } else { // Cash Payment
            newBookingData.paymentStatus = 'Pending';
            newBookingData.status = 'Confirmed';
        }

        // --- Create and Save Booking ---
        const booking = new Booking(newBookingData);
        await booking.save(); // This triggers the validation error if 'fare' is missing

        const populatedBooking = await Booking.findById(booking._id)
            .populate('user', 'name email phone')
            .populate({
                path: 'schedule',
                select: 'routeOrigin routeDestination departureDateTime arrivalDateTime vehicle driver',
                populate: [
                    { path: 'vehicle', model: 'Vehicle', select: 'model registrationNumber capacity type' },
                    { path: 'driver', model: 'Driver', select: 'name phone' }
                ]
            })
            .lean();

        console.log("Booking saved successfully:", populatedBooking._id);
        res.status(201).json({ success: true, message: 'Booking created successfully.', data: populatedBooking });
    })
);


// --- GET /api/bookings/my-bookings ---
router.get(
    '/my-bookings',
    protect,
    asyncHandler(async (req, res, next) => {
        // ... (Keep the existing my-bookings logic with isReviewed flag) ...
        const userId = req.user.id;
        console.log(`[GET /my-bookings] Request received for user: ${userId}`);
        const bookings = await Booking.find({ user: userId })
            .populate({ path: 'schedule', select: 'routeOrigin routeDestination departureDateTime arrivalDateTime vehicle driver', populate: [ { path: 'vehicle', select: 'model registrationNumber capacity type' }, { path: 'driver', select: 'name phone' } ] })
            .sort({ createdAt: -1 })
            .lean();
        console.log(`[GET /my-bookings] Found ${bookings.length} raw bookings for user: ${userId}`);
        if (!Array.isArray(bookings)) { console.error("[GET /my-bookings] Query returned non-array:", bookings); return next(new ErrorResponse('Error fetching bookings data.', 500)); }
        const completedBookingIds = bookings.filter(b => b.status === 'Completed').map(b => b._id);
        console.log(`[GET /my-bookings] Completed Booking IDs found:`, completedBookingIds.map(id => id.toString()));
        let reviewedBookingIdSet = new Set();
        let foundReviews = [];
        if (completedBookingIds.length > 0) {
            const reviews = await Review.find({ booking: { $in: completedBookingIds }, user: userId }).select('booking');
            foundReviews = reviews;
            reviews.forEach(review => reviewedBookingIdSet.add(review.booking.toString()));
            console.log(`[GET /my-bookings] Found ${reviews.length} reviews for completed bookings by user ${userId}. Reviews details:`, foundReviews);
            console.log(`[GET /my-bookings] Set of reviewed booking IDs:`, reviewedBookingIdSet);
        } else { console.log(`[GET /my-bookings] No completed bookings found for user ${userId}.`); }
        const bookingsWithReviewStatus = bookings.map(booking => {
            const bookingIdString = booking._id.toString();
            const isCompleted = booking.status === 'Completed';
            const hasReview = reviewedBookingIdSet.has(bookingIdString);
            const isReviewedFlag = isCompleted && hasReview;
            if (isCompleted) { console.log(`[GET /my-bookings] Checking booking ${bookingIdString}: Completed=${isCompleted}, HasReview=${hasReview}, Setting isReviewed=${isReviewedFlag}`); }
            return { ...booking, isReviewed: isReviewedFlag };
        });
        console.log(`[GET /my-bookings] Returning ${bookingsWithReviewStatus.length} bookings with review status.`);
        res.status(200).json({ success: true, count: bookingsWithReviewStatus.length, data: bookingsWithReviewStatus });
    })
);

// --- PUT /api/bookings/:id/cancel ---
router.put(
    '/:id/cancel',
    protect,
    asyncHandler(async (req, res, next) => {
        // ... (Keep the existing cancel logic exactly as it was) ...
        const bookingId = req.params.id; const userId = req.user.id;
        if (!mongoose.Types.ObjectId.isValid(bookingId)) { return next(new ErrorResponse('Invalid booking ID format.', 400)); }
        console.log(`[PUT /cancel] Request received for booking: ${bookingId} by user: ${userId}`);
        const booking = await Booking.findById(bookingId);
        if (!booking) { return next(new ErrorResponse(`Booking not found with ID ${bookingId}`, 404)); }
        if (booking.user.toString() !== userId) { return next(new ErrorResponse('You are not authorized to cancel this booking.', 403)); }
        if (['Completed', 'Cancelled'].includes(booking.status)) { return next(new ErrorResponse(`Booking is already ${booking.status} and cannot be cancelled.`, 400)); }
        booking.status = 'Cancelled'; await booking.save();
        console.log(`[PUT /cancel] Booking ${bookingId} cancelled successfully.`);
        const updatedBooking = await Booking.findById(bookingId).populate('user', 'name').populate({ path: 'schedule', populate: [{ path: 'vehicle' }, { path: 'driver' }]}).lean();
        res.status(200).json({ success: true, message: 'Booking cancelled successfully.', data: updatedBooking });
    })
);


// --- GET /api/schedules/:scheduleId/seats ---
// This route is still here but ideally should be moved to routes/schedules.js
router.get(
    '/:scheduleId/seats',
    protect,
    asyncHandler(async (req, res, next) => {
        // ... (Keep the existing get seats logic exactly as it was) ...
        const { scheduleId } = req.params; console.log(`[GET /:scheduleId/seats] Request for schedule: ${scheduleId}`);
        if (!mongoose.Types.ObjectId.isValid(scheduleId)) { return next(new ErrorResponse('Invalid Schedule ID format.', 400)); }
        const schedule = await Schedule.findById(scheduleId).populate('vehicle', 'capacity');
        if (!schedule || !schedule.vehicle) { return next(new ErrorResponse('Schedule or associated vehicle not found.', 404)); }
        const activeBookings = await Booking.find({ schedule: scheduleId, status: { $nin: ['Cancelled', 'Failed'] } }).select('seats passengerDetails');
        let bookedSeatNumbers = []; let femaleBookedSeatNumbers = new Set();
        activeBookings.forEach(booking => { if (Array.isArray(booking.seats)) { bookedSeatNumbers = bookedSeatNumbers.concat(booking.seats); if (Array.isArray(booking.passengerDetails) && booking.passengerDetails.length === booking.seats.length) { booking.seats.forEach((seatNum, index) => { if (booking.passengerDetails[index]?.gender === 'Female') { femaleBookedSeatNumbers.add(seatNum); } }); } } });
        const bookedSeatSet = new Set(bookedSeatNumbers);
        const baseLayout = [ { id: 'P1', number: 'P1', isFemaleOnly: false }, { id: 'D', number: 'D', status: 'driver' }, { id: 'P2', number: 'P2', isFemaleOnly: false }, { id: 'P3', number: 'P3', isFemaleOnly: false }, { id: 'P4', number: 'P4', isFemaleOnly: true }, { id: 'P5', number: 'P5', isFemaleOnly: false }, { id: 'P6', number: 'P6', isFemaleOnly: false }, ];
        const finalSeatLayout = baseLayout.map(seat => { if (seat.status === 'driver') return seat; const isBooked = bookedSeatSet.has(seat.number); const isBookedByFemale = femaleBookedSeatNumbers.has(seat.number); let status = isBooked ? 'booked' : 'available'; let finalIsFemaleOnly = (!isBooked && seat.isFemaleOnly) || isBookedByFemale; return { ...seat, status, isFemaleOnly: finalIsFemaleOnly }; });
        res.status(200).json({ success: true, data: finalSeatLayout });
    })
);


// --- Export the router ---
module.exports = router;
