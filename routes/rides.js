// routes/rides.js (Fetching from DB)
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Schedule = require('../models/Schedule'); // <-- Import the new Schedule model
const Vehicle = require('../models/Vehicle'); // <-- Import Vehicle for population check
const Booking = require('../models/Booking'); // <-- Import Booking to calculate available seats

// @route   GET /api/rides/available
// @desc    Get available rides based on origin, destination, and date
// @access  Private (User must be logged in)
router.get(
    '/available',
    protect, // Require login to search for rides
    async (req, res) => {
        // 1. Get query parameters from the request
        const { origin, destination, date } = req.query;

        // 2. Validate input
        if (!origin || !destination || !date) {
            return res.status(400).json({ success: false, message: 'Missing required query parameters: origin, destination, date.' });
        }

        // Validate date format and ensure it's not in the past (relative to start of day)
        let travelDateStart, travelDateEnd;
        try {
            const requestedDate = new Date(date);
            if (isNaN(requestedDate.getTime())) throw new Error('Invalid date format');

            // Set time to start and end of the requested day in server's local timezone
            // Adjust timezone handling if necessary (e.g., using UTC)
            travelDateStart = new Date(requestedDate.setHours(0, 0, 0, 0));
            travelDateEnd = new Date(requestedDate.setHours(23, 59, 59, 999));

            const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
            if (travelDateStart < todayStart) {
                 return res.status(400).json({ success: false, message: 'Cannot search for rides on past dates.' });
            }

        } catch(e) {
             return res.status(400).json({ success: false, message: 'Invalid date format provided.' });
        }


        console.log(`Searching for rides from ${origin} to ${destination} on ${date}`);

        try {
            // 3. Query the Schedule collection
            const schedules = await Schedule.find({
                routeOrigin: origin,
                routeDestination: destination,
                departureDateTime: {
                    $gte: travelDateStart, // Greater than or equal to start of day
                    $lte: travelDateEnd    // Less than or equal to end of day
                },
                status: 'Scheduled' // Only find rides that are actually scheduled
            })
            .populate('vehicle', 'type capacity isActive') // Populate vehicle details
            // .populate('driver', 'name') // Optionally populate driver name
            .sort({ departureDateTime: 1 }); // Sort by departure time ascending

            if (!schedules || schedules.length === 0) {
                return res.status(200).json({ success: true, count: 0, data: [], message: 'No scheduled rides found for this route and date.' });
            }

            // 4. Calculate available seats for each schedule (More advanced)
            // This requires querying the Bookings collection for each schedule found
            const availableRidesPromises = schedules.map(async (schedule) => {
                if (!schedule.vehicle || !schedule.vehicle.isActive) {
                    return null; // Skip if vehicle is missing or inactive
                }

                // Find total passengers booked for this specific schedule ID
                const bookingsForSchedule = await Booking.find({
                    // Assuming you add a 'schedule' ref to your Booking model later
                    // schedule: schedule._id,
                    // For now, approximate by matching vehicle and date/time (less accurate)
                    vehicle: schedule.vehicle._id,
                    travelDateTime: schedule.departureDateTime, // Match exact time for now
                    status: { $nin: ['Cancelled', 'Pending'] } // Count confirmed/ongoing/completed bookings
                });

                const bookedSeats = bookingsForSchedule.reduce((sum, booking) => sum + booking.passengers, 0);
                const availableSeats = schedule.vehicle.capacity - bookedSeats;

                // Only return rides with available seats
                if (availableSeats > 0) {
                    // Return data in the format expected by the frontend
                    return {
                        id: schedule._id, // Use schedule ID as the ride ID
                        departureTime: schedule.departureDateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
                        arrivalTime: schedule.arrivalDateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
                        vehicleType: schedule.vehicle.type,
                        seatsAvailable: availableSeats,
                        farePerSeat: schedule.farePerSeat
                        // Add driver name if populated: driverName: schedule.driver?.name
                    };
                } else {
                    return null; // No seats available
                }
            });

            // Wait for all the seat calculations to complete
            const availableRidesResults = await Promise.all(availableRidesPromises);
            // Filter out any null results (rides with no seats or inactive vehicles)
            const finalAvailableRides = availableRidesResults.filter(ride => ride !== null);


            res.status(200).json({
                success: true,
                count: finalAvailableRides.length,
                data: finalAvailableRides // Send back the array of available rides with seat counts
            });

        } catch (error) {
            console.error('Error fetching available rides:', error);
            res.status(500).json({ success: false, message: 'Server error fetching available rides.' });
        }
    }
);

module.exports = router;
