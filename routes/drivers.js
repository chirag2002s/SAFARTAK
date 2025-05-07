// routes/drivers.js
const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver'); // Import the Driver model
const { protect, authorize } = require('../middleware/authMiddleware'); // Import protection middleware

// @route   POST /api/drivers
// @desc    Create a new driver
// @access  Private/Admin
router.post(
  '/', // Base path is '/api/drivers'
  protect,
  authorize('admin'), // Only admins can add drivers
  async (req, res) => {
    try {
      // Extract driver data from request body
      const { name, phone, licenseNumber, assignedVehicle } = req.body;

      // Basic check for required fields
      if (!name || !phone || !licenseNumber) {
        return res.status(400).json({ success: false, message: 'Please provide name, phone, and license number' });
      }

      // Check if driver with the same phone or license number already exists
      // Use lean() for performance if we only need to check existence
      const existingDriver = await Driver.findOne({
        $or: [{ phone: phone.trim() }, { licenseNumber: licenseNumber.toUpperCase().trim() }]
      }).lean();

      if (existingDriver) {
        const conflictField = existingDriver.phone === phone.trim() ? 'Phone number' : 'License number';
        return res.status(400).json({ success: false, message: `Driver with this ${conflictField} already exists` });
      }

      // Create new driver instance
      // assignedVehicle is optional
      const newDriverData = {
        name,
        phone, // Schema likely handles trim/validation
        licenseNumber, // Schema likely handles trim/uppercase/validation
        ...(assignedVehicle && { assignedVehicle }) // Conditionally add assignedVehicle if provided and not empty
      };

      const newDriver = new Driver(newDriverData);

      // Save driver to database
      const driver = await newDriver.save();

      res.status(201).json({ // 201 Created
        success: true,
        data: driver
      });

    } catch (error) {
      console.error('Error creating driver:', error);
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, message: messages.join('. ') });
      }
      // Handle potential duplicate key error (if unique index exists and initial check missed somehow)
      if (error.code === 11000) {
          const duplicateField = error.message.includes('phone') ? 'phone number' : 'license number';
          return res.status(400).json({ success: false, message: `Duplicate value entered for ${duplicateField}.` });
      }
      // General server error
      res.status(500).json({ success: false, message: 'Server Error creating driver' });
    }
  }
);

// @route   GET /api/drivers
// @desc    Get all drivers
// @access  Private/Admin
router.get(
    '/', // Matches GET requests to /api/drivers
    protect,
    authorize('admin'), // Only admins can get the full list
    async (req, res) => {
      try {
        // Fetch all documents from the Driver collection
        // Consider adding pagination later for large datasets
        // Example: .select('-someField') to exclude fields or .populate('assignedVehicle') to include vehicle details
        const drivers = await Driver.find(); // .populate('assignedVehicle', 'registrationNumber type');

        res.status(200).json({
          success: true,
          count: drivers.length, // Include the count of drivers found
          data: drivers          // Send the array of driver objects
        });
      } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching drivers' });
      }
    }
);

// @route   GET /api/drivers/:id
// @desc    Get a single driver by ID
// @access  Private/Admin
router.get(
    '/:id', // Matches GET requests like /api/drivers/some_mongo_db_id
    protect,
    authorize('admin'), // Only admins can view driver details this way (adjust if needed)
    async (req, res) => {
      try {
        // Find driver by ID from the URL parameter
        const driver = await Driver.findById(req.params.id);
        // Optional: Populate assigned vehicle if needed
        // const driver = await Driver.findById(req.params.id).populate('assignedVehicle', 'registrationNumber type');

        // Check if driver was found
        if (!driver) {
          return res.status(404).json({
            success: false,
            message: `Driver not found with id of ${req.params.id}`
          });
        }

        // Return driver data
        res.status(200).json({
          success: true,
          data: driver
        });
      } catch (error) {
        console.error('Error fetching single driver:', error);
        // Handle invalid MongoDB ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: `Invalid driver ID format: ${req.params.id}` });
        }
        // General server error
        res.status(500).json({ success: false, message: 'Server Error fetching driver' });
      }
    }
);

// @route   PUT /api/drivers/:id
// @desc    Update driver details
// @access  Private/Admin
router.put(
    '/:id',
    protect,
    authorize('admin'), // Only admins can update driver details
    async (req, res) => {
      const driverId = req.params.id; // Capture ID early for error messages
      try {
        // Extract potentially updatable fields from request body
        // Note: It's generally not recommended to allow updating licenseNumber via PUT
        const { name, phone, assignedVehicle } = req.body;

        // Construct object with fields to update (only include fields that were actually provided)
        const fieldsToUpdate = {};
        if (name !== undefined) fieldsToUpdate.name = name.trim(); // Trim whitespace
        if (phone !== undefined) fieldsToUpdate.phone = phone.trim(); // Trim whitespace
        // Allow setting vehicle to null or an empty string to unassign
        if (assignedVehicle !== undefined) {
            fieldsToUpdate.assignedVehicle = assignedVehicle === '' ? null : assignedVehicle;
        }


        // Check if there's anything to update
        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ success: false, message: 'No fields provided for update (name, phone, assignedVehicle)' });
        }

        // ** Uniqueness Check for Phone (if phone is being updated) **
        if (fieldsToUpdate.phone) {
            const existingDriverWithPhone = await Driver.findOne({
                phone: fieldsToUpdate.phone,
                _id: { $ne: driverId } // Important: Exclude the current driver being updated
            }).lean();
            if (existingDriverWithPhone) {
                return res.status(400).json({ success: false, message: `Phone number ${fieldsToUpdate.phone} is already in use by another driver.` });
            }
        }
        // Add similar check for licenseNumber if you were allowing its update

        // Find the driver by ID and update it
        // { new: true } returns the modified document rather than the original
        // { runValidators: true } ensures schema validations are run on update
        const updatedDriver = await Driver.findByIdAndUpdate(
          driverId,
          fieldsToUpdate,
          { new: true, runValidators: true }
        ); // Can also chain .populate() here if needed

        // Check if driver was found and updated
        if (!updatedDriver) {
          return res.status(404).json({
            success: false,
            message: `Driver not found with id of ${driverId}`
          });
        }

        // Return 200 OK with updated driver data
        res.status(200).json({
          success: true,
          data: updatedDriver
        });

      } catch (error) {
        console.error(`Error updating driver with ID ${driverId}:`, error);
        // Handle invalid MongoDB ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: `Invalid driver ID format: ${driverId}` });
        }
        // Handle Mongoose validation errors during update
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        // Handle potential duplicate key error on update (if unique index exists)
        if (error.code === 11000 && error.keyPattern && error.keyPattern.phone) {
             return res.status(400).json({ success: false, message: `Phone number ${fieldsToUpdate.phone} is already in use.` });
        }
        // General server error
        res.status(500).json({ success: false, message: 'Server Error updating driver' });
      }
    }
);

// @route   DELETE /api/drivers/:id
// @desc    Delete a driver
// @access  Private/Admin
router.delete(
  '/:id',
  protect,
  authorize('admin'), // Ensure only admins can delete
  async (req, res) => {
    const driverId = req.params.id; // Capture ID for potential error messages
    try {
      // Find the driver first to ensure it exists before attempting deletion
      const driver = await Driver.findById(driverId);

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: `Driver not found with id of ${driverId}`
        });
      }

      // Optional: Add logic here if deleting a driver requires other actions
      // e.g., unassigning them from a vehicle model if there's a two-way relationship
      // Example: await Vehicle.updateMany({ assignedDriver: driverId }, { $unset: { assignedDriver: "" } });

      // Perform the delete operation
      await driver.deleteOne(); // or await Driver.findByIdAndDelete(driverId);

      res.status(200).json({
        success: true,
        message: `Driver ${driver.name} (ID: ${driverId}) deleted successfully`,
        data: {} // Often good practice to return an empty object or the id of the deleted resource
      });

    } catch (error) {
      console.error(`Error deleting driver with ID ${driverId}:`, error);
      // Handle invalid MongoDB ObjectId format
      if (error.name === 'CastError') {
          return res.status(400).json({ success: false, message: `Invalid driver ID format: ${driverId}` });
      }
      // General server error
      res.status(500).json({ success: false, message: 'Server Error deleting driver' });
    }
  }
);


module.exports = router; // Export the router for use in the main server file