// server.js (Backend - With Specific CORS Configuration)

// --- 1. Import Dependencies ---
const express = require('express');
const cors = require('cors'); // Make sure cors is imported
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
// const colors = require('colors');

// --- 2. Load Environment Variables ---
dotenv.config();

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
const userRoutes = require('./routes/userRoutes'); // Ensure this is imported

// --- 4. Connect to Database ---
connectDB();

// --- 5. Initialize Express App ---
const app = express();

// --- 6. Core Middleware ---

// *** Configure CORS Options ***
const allowedOrigins = [
    // Add your Netlify deployment URL (replace if different)
    'https://safartak.netlify.app',

    // Add your custom domain if you set one up
    // 'https://yourdomain.com',
    // 'https://www.yourdomain.com',

    // Origins used by Capacitor/WebView (for potential future APK testing)
    'http://localhost',
    'capacitor://localhost',

    // Your local development frontend URL
    'http://localhost:5173' // Adjust port if needed
];

const corsOptions = {
   origin: function (origin, callback) {
     // Allow requests with no origin (like mobile apps, Postman) or from allowed list
     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
       console.log(`CORS: Allowing origin: ${origin || 'No Origin (Allowed)'}`);
       callback(null, true); // Allow the request
     } else {
       console.error(`CORS Error: Origin ${origin} not allowed.`);
       callback(new Error('Not allowed by CORS')); // Block the request
     }
   },
   optionsSuccessStatus: 200, // For legacy browser compatibility
   credentials: true // Allow cookies/authorization headers if needed
};

app.use(cors(corsOptions)); // *** Use configured CORS options ***
// ***************************

app.use(express.json()); // Enable parsing of JSON request bodies

// --- 7. Define Base Route (Optional) ---
app.get('/', (req, res) => {
  res.send('Safartak API is running...');
});

// --- 8. Mount API Routers ---
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes); // Ensure userRoutes is mounted

// --- ERROR HANDLER MIDDLEWARE (MUST BE LAST after routes) ---
app.use(errorHandler);

// --- 9. Define Port ---
const PORT = process.env.PORT || 5000;

// --- 10. Start Server ---
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection: ${err.message}`, err);
    // server.close(() => process.exit(1));
});

module.exports = app;
