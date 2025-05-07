// routes/auth.js
const express = require('express');
const router = express.Router();

// Import controller functions
const {
    registerUser,
    loginUser,
    adminLoginUser, // Added admin login controller import
    getMe,
    updateDetails,
    updatePassword,
    sendOtp,
    verifyOtp,
    completeRegistration,
    getUsers // Added getUsers controller import
} = require('../controllers/authController'); // Adjust path if needed

// Import middleware
const { protect, authorize } = require('../middleware/authMiddleware'); // Your authentication middleware

console.log('--- Loading routes/auth.js ---');

// --- Define Routes ---

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', adminLoginUser); // Route for admin login
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/complete-registration', completeRegistration);

// Private Routes (require login token)
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

// Admin Routes (require login token + admin role)
router.get('/users', protect, authorize('admin'), getUsers);
console.log('--- Definition for GET /users processed ---');


module.exports = router;
