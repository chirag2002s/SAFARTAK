// server.js (Backend - With Error Handler Middleware Implemented)

// --- 1. Import Dependencies ---
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Assuming './config/db.js' exports the connection function
const errorHandler = require('./middleware/errorHandler'); // +++ IMPORT ERROR HANDLER +++
// const colors = require('colors'); // Optional: For colored console logs

// --- 2. Load Environment Variables ---
dotenv.config(); // Loads variables from '.env' file in the project root

// --- 3. Import Route Files ---
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const bookingRoutes = require('./routes/bookings');
const driverRoutes = require('./routes/drivers');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/payments');
const rideRoutes = require('./routes/rides');
const scheduleRoutes = require('./routes/schedules');
const reviewRoutes = require('./routes/reviewRoutes');

// --- 4. Connect to Database ---
connectDB();

// --- 5. Initialize Express App ---
const app = express();

// --- 6. Core Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing of JSON request bodies

// --- 7. Define Base Route (Optional) ---
app.get('/', (req, res) => {
  res.send('Safartak API is running...');
});

// --- 8. Mount API Routers ---
// Define base paths for your different route groups
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rides', rideRoutes); // Consider if this is needed or handled by schedules
app.use('/api/schedules', scheduleRoutes);
app.use('/api/reviews', reviewRoutes);

// --- ERROR HANDLER MIDDLEWARE (MUST BE LAST after routes) ---
app.use(errorHandler); // +++ USE ERROR HANDLER +++

// --- 9. Define Port ---
const PORT = process.env.PORT || 5000;

// --- 10. Start Server ---
const server = app.listen(PORT, () => { // Added 'server' variable for graceful shutdown
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections (Optional but good practice)
process.on('unhandledRejection', (err, promise) => {
    // console.log(`Unhandled Rejection: ${err.message}`.red); // Using .red for emphasis if you have 'colors' package
    console.error(`Unhandled Rejection: ${err.message}`, err); // Log the full error
    // Close server & exit process
    // server.close(() => process.exit(1));
});

module.exports = app; // Export app if needed for testing or other purposes
