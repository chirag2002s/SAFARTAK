// routes/vehicles.js
const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle'); // Import the Vehicle model
const { protect, authorize } = require('../middleware/authMiddleware'); // Import protection middleware

// === CREATE Vehicle ===
// @route   POST /api/vehicles
// @desc    Create a new vehicle
// @access  Private/Admin
router.post(
  '/',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const { registrationNumber, type, capacity, features } = req.body;
      if (!registrationNumber || !type || !capacity) {
        return res.status(400).json({ success: false, message: 'Please provide registration number, type, and capacity' });
      }
      let existingVehicle = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase().trim() });
      if (existingVehicle) {
        return res.status(400).json({ success: false, message: `Vehicle with registration number ${registrationNumber} already exists` });
      }
      const newVehicle = new Vehicle({ registrationNumber, type, capacity, features });
      const vehicle = await newVehicle.save();
      res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
      console.error('Error creating vehicle:', error);
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
      }
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: 'Duplicate field value entered (likely registration number)' });
      }
      res.status(500).json({ success: false, message: 'Server Error creating vehicle' });
    }
  }
);

// === GET ALL Vehicles ===
// @route   GET /api/vehicles
// @desc    Get all vehicles
// @access  Private/Admin
router.get(
  '/',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const vehicles = await Vehicle.find();
      res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ success: false, message: 'Server Error fetching vehicles' });
    }
  }
);

// === GET SINGLE Vehicle by ID ===
// @route   GET /api/vehicles/:id
// @desc    Get a single vehicle by its ID
// @access  Private/Admin
router.get(
  '/:id',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const vehicle = await Vehicle.findById(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ success: false, message: `Vehicle not found with id of ${req.params.id}` });
      }
      res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
      console.error('Error fetching single vehicle:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: `Invalid vehicle ID format: ${req.params.id}` });
      }
      res.status(500).json({ success: false, message: 'Server Error fetching vehicle' });
    }
  }
);

// === UPDATE Vehicle by ID ===
// @route   PUT /api/vehicles/:id
// @desc    Update a vehicle by its ID
// @access  Private/Admin
router.put(
  '/:id',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const { type, capacity, features, isActive } = req.body;
      const fieldsToUpdate = {};
      if (type !== undefined) fieldsToUpdate.type = type;
      if (capacity !== undefined) fieldsToUpdate.capacity = capacity;
      if (features !== undefined) fieldsToUpdate.features = features;
      if (isActive !== undefined) fieldsToUpdate.isActive = isActive;

      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ success: false, message: 'Please provide fields to update' });
      }

      const updatedVehicle = await Vehicle.findByIdAndUpdate(
        req.params.id,
        fieldsToUpdate,
        { new: true, runValidators: true }
      );

      if (!updatedVehicle) {
        return res.status(404).json({ success: false, message: `Vehicle not found with id of ${req.params.id}` });
      }
      res.status(200).json({ success: true, data: updatedVehicle });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: `Invalid vehicle ID format: ${req.params.id}` });
      }
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
      }
      res.status(500).json({ success: false, message: 'Server Error updating vehicle' });
    }
  }
);

// === DELETE Vehicle by ID ===
// @route   DELETE /api/vehicles/:id
// @desc    Delete a vehicle by its ID
// @access  Private/Admin
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
      if (!deletedVehicle) {
        return res.status(404).json({ success: false, message: `Vehicle not found with id of ${req.params.id}` });
      }
      res.status(200).json({ success: true, message: 'Vehicle deleted successfully', data: {} });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: `Invalid vehicle ID format: ${req.params.id}` });
      }
      res.status(500).json({ success: false, message: 'Server Error deleting vehicle' });
    }
  }
);

// Export the router
module.exports = router;