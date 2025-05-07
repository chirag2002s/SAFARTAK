// routes/adminRoutes.js (or similar)
const express = require('express');
const router = express.Router(); // Admin router instance

// Import necessary models and middleware
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle'); // Need Vehicle model
const Driver = require('../models/Driver');   // Need Driver model
const { protect, authorize } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// --- Other Admin Routes ---
// ... (Vehicle/Driver CRUD routes) ...
// ... (GET /api/admin/bookings route from previous step - concise) ...
router.get('/bookings', protect, authorize('admin'), async (req, res) => {
    // ... Get all bookings logic ...
    try {
        const page = parseInt(req.query.page, 10) || 1; const limit = parseInt(req.query.limit, 10) || 20; const skip = (page - 1) * limit;
        const queryFilter = {}; // Build filter based on req.query...
        let sortOptions = { createdAt: -1 }; // Build sort based on req.query...
        // Example filter additions:
        if (req.query.status && Booking.schema.path('status').enumValues.includes(req.query.status)) { queryFilter.status = req.query.status; }
        // ... (add other filters like userId, vehicleId, driverId, travelDate) ...
        // Example sort additions:
        if (req.query.sort && Booking.schema.path(req.query.sort.replace('-', ''))) { const sortField = req.query.sort.replace('-', ''); const sortOrder = req.query.sort.startsWith('-') ? -1 : 1; sortOptions = { [sortField]: sortOrder }; }

        const totalBookings = await Booking.countDocuments(queryFilter);
        const bookings = await Booking.find(queryFilter).populate('user', 'name email phone').populate('vehicle', 'registrationNumber type').populate('driver', 'name phone').sort(sortOptions).skip(skip).limit(limit);
        res.status(200).json({ success: true, count: bookings.length, pagination: { total: totalBookings, page, limit, totalPages: Math.ceil(totalBookings / limit) }, data: bookings });
    } catch (error) { console.error('Error fetching all bookings for admin:', error); res.status(500).json({ success: false, message: 'Server error fetching bookings.' }); }
});


// @route   PUT /api/admin/bookings/:id/assign
// @desc    Assign a vehicle and/or driver to a booking
// @access  Private (Admin)
router.put(
    '/bookings/:id/assign', // Mounted at /api/admin
    protect,
    authorize('admin'),
    async (req, res) => {
        try {
            const bookingId = req.params.id;
            const { vehicleId, driverId } = req.body;

            // 1. Validate IDs
            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({ success: false, message: `Invalid booking ID format: ${bookingId}` });
            }
            if (!vehicleId && !driverId) {
                return res.status(400).json({ success: false, message: 'Please provide at least a vehicleId or a driverId to assign.' });
            }
            if (vehicleId && !mongoose.Types.ObjectId.isValid(vehicleId)) {
                return res.status(400).json({ success: false, message: `Invalid vehicle ID format: ${vehicleId}` });
            }
            if (driverId && !mongoose.Types.ObjectId.isValid(driverId)) {
                return res.status(400).json({ success: false, message: `Invalid driver ID format: ${driverId}` });
            }

            // 2. Find the booking
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ success: false, message: `Booking not found with id ${bookingId}` });
            }

            // 3. Business Logic Checks
            // 3a. Check booking status (only allow assignment for Pending/Confirmed)
            if (!['Pending', 'Confirmed'].includes(booking.status)) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot assign vehicle/driver to a booking with status '${booking.status}'.`
                });
            }

            // 3b. Check if provided Vehicle exists (if vehicleId is provided)
            if (vehicleId) {
                const vehicleExists = await Vehicle.findById(vehicleId);
                if (!vehicleExists) {
                    return res.status(404).json({ success: false, message: `Vehicle not found with id ${vehicleId}` });
                }
                // Optional: Add check for vehicle capacity vs booking.passengers
                // if (vehicleExists.capacity < booking.passengers) { ... }
                // Optional: Add check if vehicle is active
                 // if (!vehicleExists.isActive) { ... }
            }

            // 3c. Check if provided Driver exists (if driverId is provided)
            if (driverId) {
                const driverExists = await Driver.findById(driverId);
                if (!driverExists) {
                    return res.status(404).json({ success: false, message: `Driver not found with id ${driverId}` });
                }
                 // Optional: Check driver availability (complex - requires checking other bookings for overlaps)
            }

            // 4. Perform Update
            let statusUpdated = false;
            if (vehicleId) {
                booking.vehicle = vehicleId;
            }
            if (driverId) {
                booking.driver = driverId;
            }

            // 4a. Update status to 'Confirmed' if it was 'Pending' and assignment happened
            if (booking.status === 'Pending' && (vehicleId || driverId)) {
                 booking.status = 'Confirmed';
                 statusUpdated = true;
            }

            const updatedBooking = await booking.save();

            // 5. Respond (populate the updated booking for confirmation)
            const populatedBooking = await Booking.findById(updatedBooking._id)
                .populate('user', 'name email phone')
                .populate('vehicle', 'registrationNumber type capacity')
                .populate('driver', 'name phone licenseNumber');

            res.status(200).json({
                success: true,
                message: `Booking ${statusUpdated ? 'confirmed' : 'updated'} with assignments.`,
                data: populatedBooking
            });

        } catch (error) {
            console.error(`Error assigning to booking ${req.params.id}:`, error);
            if (error.name === 'CastError') {
                return res.status(400).json({ success: false, message: `Invalid ID format encountered during assignment.` });
            }
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(val => val.message);
                return res.status(400).json({ success: false, message: messages.join('. ') });
            }
            res.status(500).json({ success: false, message: 'Server error assigning vehicle/driver.' });
        }
    }
);

// --- Other Admin Booking Routes ---

module.exports = router;