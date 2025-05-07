const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Make sure process.env.MONGO_URI is used here and spelled correctly
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose connection options (might differ slightly)
      // useNewUrlParser: true, // No longer needed in Mongoose 6+
      // useUnifiedTopology: true, // No longer needed in Mongoose 6+
      // useCreateIndex: true, // No longer supported
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`); // Log the specific error
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;