// models/User.js
const mongoose = require('mongoose'); // Import mongoose
const bcrypt = require('bcryptjs');   // *** Make sure bcryptjs is imported ***

// Define the schema for the User collection
const UserSchema = new mongoose.Schema(
  {
    // Define the 'name' field
    name: {
      type: String, // Data type is String
      required: [true, 'Please add a name'], // Name is required
      trim: true,
    },
    // Define the 'email' field
    email: {
      type: String,
      // required: false, // Email is optional
      unique: true, // Still enforce uniqueness if email IS provided
      sparse: true, // Allow multiple users to have no email
      match: [ // Optional: Basic check for email format
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
      trim: true,
      lowercase: true,
    },
    // Define the 'phone' field
    phone: {
      type: String,
      required: [true, 'Please add a phone number'], // Phone is required
      unique: true, // No two users can have the same phone number
      trim: true,
    },
    // Define the 'password' field
    password: {
      type: String,
      // required: false, // Password is optional
      minlength: 6, // Optional: Enforce a minimum length if password is set
      select: false // Optional: Hides password by default when fetching user data
    },
    // Define the 'role' field
    role: {
      type: String,
      enum: ['user', 'admin'], // Only allowed values are 'user' or 'admin'
      default: 'user', // If not provided, defaults to 'user'
    },
    // You might have other fields like profilePicture, savedLocations etc.
  },
  {
    // Schema options
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);


// *** UNCOMMENTED and Refined: Pre-save hook for password hashing ***
// Only hash password if it exists and is modified
UserSchema.pre('save', async function(next) {
  // Check if password field exists on the document and if it has been modified
  // Also check if password is not null or empty before hashing
  if (!this.password || !this.isModified('password')) {
    return next(); // Skip hashing if password isn't present or wasn't changed
  }

  // Only proceed to hash if password is provided and modified
  console.log(`Hashing password for user: ${this.name || this.phone}`); // Added log
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error); // Pass error to the next middleware/save operation
  }
});


// *** ADDED: Method to compare entered password with the hashed password ***
UserSchema.methods.matchPassword = async function (enteredPassword) {
    // 'this.password' refers to the hashed password stored in the current user document
    // Need to ensure the password field was selected when fetching the user if select: false is used
    if (!this.password) {
        // Handle users who might not have a password (e.g., OTP only signup)
        return false;
    }
    // Compare the provided password with the stored hash
    return await bcrypt.compare(enteredPassword, this.password);
};


// Create and export the User model based on the schema
// Mongoose will create a collection named 'users' (lowercase, pluralized)
module.exports = mongoose.model('User', UserSchema);
