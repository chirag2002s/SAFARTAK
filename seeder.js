// seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors'); // Optional: for colorful console output (npm install colors)
const connectDB = require('./config/db'); // Adjust path if needed

// Load env vars
dotenv.config();

// Load models (Adjust paths as needed)
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Schedule = require('./models/Schedule');
const Booking = require('./models/Booking'); // Optional: To delete bookings if needed
// const User = require('./models/User'); // Optional: To delete users if needed

// Connect to DB
connectDB();

// --- Sample Data ---

// Use mongoose.Types.ObjectId to generate valid IDs for linking
const vehicle1Id = new mongoose.Types.ObjectId();
const vehicle2Id = new mongoose.Types.ObjectId();
const driver1Id = new mongoose.Types.ObjectId();
const driver2Id = new mongoose.Types.ObjectId();

const vehiclesData = [
  {
    _id: vehicle1Id,
    model: 'Force Urbania',
    type: 'Force Urbania', // Use valid type from enum
    capacity: 6,
    registrationNumber: 'UP32 XY 1234',
    color: 'White',
    isActive: true,
    features: ['AC', 'Charging Ports'],
  },
  {
    _id: vehicle2Id,
    model: 'Maruti Suzuki Ertiga',
    type: 'Ertiga', // Use valid type from enum
    capacity: 6,
    registrationNumber: 'UP32 AB 5678',
    color: 'White',
    isActive: true,
    features: ['AC', 'Music System'],
  },
];

const driversData = [
  {
    _id: driver1Id,
    name: 'Ramesh Kumar',
    phone: '9876543210',
    licenseNumber: 'DL12345XYZ12345',
  },
  {
    _id: driver2Id,
    name: 'Suresh Singh',
    phone: '9876543211',
    licenseNumber: 'DL67890ABC67890',
  },
];

// Sample Schedules (Link using the IDs generated above)
const schedulesData = [
  {
    routeOrigin: 'Lucknow',
    routeDestination: 'Kanpur',
    // *** Corrected field names ***
    departureDateTime: new Date('2025-06-15T08:00:00.000Z'), // Use future dates for testing
    arrivalDateTime: new Date('2025-06-15T11:30:00.000Z'),
    // ***************************
    vehicle: vehicle1Id, // Link to Force Urbania
    driver: driver1Id,   // Link to driver 1
    farePerSeat: 450,
    status: 'Scheduled',
    isActive: true,
  },
  {
    routeOrigin: 'Lucknow',
    routeDestination: 'Kanpur',
     // *** Corrected field names ***
    departureDateTime: new Date('2025-05-15T14:00:00.000Z'),
    arrivalDateTime: new Date('2025-05-15T17:30:00.000Z'),
     // ***************************
    vehicle: vehicle2Id, // Link to Ertiga
    driver: driver2Id,   // Link to driver 2
    farePerSeat: 460,
    status: 'Scheduled',
    isActive: true  ,
  },
  {
    routeOrigin: 'Agra',
    routeDestination: 'Lucknow',
     // *** Corrected field names ***
    departureDateTime: new Date('2025-06-16T10:00:00.000Z'),
    arrivalDateTime: new Date('2025-06-16T16:00:00.000Z'),
     // ***************************
    vehicle: vehicle1Id, // Link to Force Urbania
    driver: driver1Id,   // Link to driver 1
    farePerSeat: 650,
    status: 'Scheduled',
    isActive: true,
  },
];

// --- Seeder Functions ---

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data first
    console.log('Clearing existing data...'.yellow);
    await Vehicle.deleteMany();
    await Driver.deleteMany();
    await Schedule.deleteMany();
    await Booking.deleteMany(); // Optional: Clear bookings too
    console.log('Existing data cleared.'.yellow);

    // Insert new data
    console.log('Inserting sample data...'.cyan);
    await Vehicle.insertMany(vehiclesData);
    console.log('Vehicles Imported...'.green);
    await Driver.insertMany(driversData);
    console.log('Drivers Imported...'.green);
    await Schedule.insertMany(schedulesData); // This should now work
    console.log('Schedules Imported...'.green);


    console.log('Data Imported Successfully!'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(`Error during data import: ${err}`.red.inverse);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    console.log('Destroying data...'.yellow);
    await Vehicle.deleteMany();
    await Driver.deleteMany();
    await Schedule.deleteMany();
    await Booking.deleteMany(); // Optional: Clear bookings too

    console.log('Data Destroyed!'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(`Error during data destruction: ${err}`.red.inverse);
    process.exit(1);
  }
};

// --- Command Line Argument Handling ---
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Usage:');
  console.log('  node seeder -i   (to import data)');
  console.log('  node seeder -d   (to destroy data)');
  process.exit();
}
