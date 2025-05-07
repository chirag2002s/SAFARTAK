// routes/payments.js (Backend) - Corrected create-order route

const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto'); // Node.js built-in crypto module for signature verification
const { protect } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking'); // Import Booking model for verification step
const mongoose = require('mongoose'); // For validating ObjectId

// Initialize Razorpay client
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("FATAL ERROR: Razorpay API Keys not found in environment variables.");
  // Consider exiting if keys are essential: process.exit(1);
}
const razorpayInstance = process.env.RAZORPAY_KEY_ID ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}) : null;


// @route   POST /api/payments/create-order
// @desc    Create a Razorpay order ID **before** booking creation
// @access  Private (User must be logged in)
router.post(
  '/create-order',
  protect, // Ensure user is logged in
  async (req, res) => {
    // Check if Razorpay was initialized
    if (!razorpayInstance) {
        console.error("Razorpay instance not available. Check API keys.");
        return res.status(500).json({ success: false, message: 'Payment service configuration error.' });
    }

    // *** Get amount and optional notes directly from request body ***
    // *** Removed bookingId from here ***
    const { amount, currency = 'INR', notes = {} } = req.body;

    // Validate amount
    if (amount === undefined || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ success: false, message: 'Valid amount is required.' });
    }

    // Amount should be in the smallest currency unit (e.g., paisa for INR)
    const amountInPaisa = Math.round(parseFloat(amount) * 100);

    // Prepare Razorpay order options
    const options = {
        amount: amountInPaisa,
        currency: currency,
        receipt: `receipt_${req.user.id}_${Date.now()}`, // Generate a unique receipt ID
        notes: { // Optional notes passed from frontend (like scheduleId, seats)
            userId: req.user.id.toString(), // Log which user initiated
            ...notes
        }
    };

    try {
        console.log(`Creating Razorpay order for user ${req.user.id}, amount ${amountInPaisa} paise`);
        const order = await razorpayInstance.orders.create(options);
        console.log("Razorpay Order Created:", order.id);

        if (!order) {
            return res.status(500).json({ success: false, message: 'Razorpay order creation failed.' });
        }

        // Send back the order details and Key ID to the frontend
        res.status(200).json({
            success: true, message: 'Order created.',
            order: { id: order.id, amount: order.amount, currency: order.currency, receipt: order.receipt }, // Send necessary order details
            razorpayKeyId: process.env.RAZORPAY_KEY_ID // Frontend needs this
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        if (error.statusCode && error.error) {
            return res.status(error.statusCode).json({ success: false, message: error.error.description || 'Razorpay error creating order.' });
        }
        res.status(500).json({ success: false, message: error.message || 'Server error creating payment order.' });
    }
  }
);


// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment signature (THIS IS USUALLY HANDLED BY THE BOOKING CREATION ROUTE NOW)
// @access  Private (User must be logged in)
// NOTE: This separate verification route might become redundant if the signature
//       verification is handled within the POST /api/bookings route when paymentMethod is 'Online'.
//       Keeping it here for now based on your provided code, but consider consolidating.
router.post(
    '/verify',
    protect, // Ensure user is logged in
    async (req, res) => {
        // Check if Razorpay was initialized
        if (!razorpayInstance) { /* ... handle error ... */ }

        const secret = process.env.RAZORPAY_KEY_SECRET;

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId // Sent from frontend handler (assuming booking was created before this)
        } = req.body;

        // Validate input
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) { /* ... */ }
        if (!mongoose.Types.ObjectId.isValid(bookingId)) { /* ... */ }

        // Verify Razorpay Signature
        const bodyString = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto.createHmac('sha256', secret).update(bodyString).digest('hex');
        const isSignatureValid = expectedSignature === razorpay_signature;

        if (isSignatureValid) {
            console.log(`Payment Signature Verified for Order ID: ${razorpay_order_id}, Payment ID: ${razorpay_payment_id}`);
            try {
                // Find the booking and update status
                const booking = await Booking.findOne({ _id: bookingId, user: req.user.id });
                if (!booking) { /* ... handle error ... */ }
                if (booking.paymentStatus === 'Success') { /* ... handle already paid ... */ }

                // Update the booking in the database
                booking.paymentStatus = 'Success';
                booking.paymentId = razorpay_payment_id;
                if (booking.status === 'Pending') { booking.status = 'Confirmed'; }
                const updatedBooking = await booking.save();
                console.log(`Booking ${bookingId} payment status updated to Success.`);

                const populatedUpdatedBooking = await Booking.findById(updatedBooking._id)
                    .populate('user', 'name email phone') // Example population
                    .lean();

                res.status(200).json({
                    success: true,
                    message: 'Payment verified successfully and booking updated.',
                    booking: populatedUpdatedBooking
                });

            } catch(dbError) {
                console.error(`Error updating booking ${bookingId} after payment verification:`, dbError);
                res.status(500).json({ success: false, message: 'Payment verified, but failed to update booking status.' });
            }
        } else {
            console.warn(`Payment Signature Verification Failed for Order ID: ${razorpay_order_id}`);
            res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature.' });
        }
});

module.exports = router;
