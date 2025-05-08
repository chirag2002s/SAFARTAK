// src/pages/admin/AddVehiclePage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
import { addVehicle } from '../../services/vehicleService'; // Adjust path if needed

function AddVehiclePage() {
  const { token } = useAuth(); // Get token for API call
  const navigate = useNavigate(); // To redirect after success

  // State for form fields
  const [formData, setFormData] = useState({
    registrationNumber: '',
    type: '',
    capacity: '',
    features: '', // Store features as comma-separated string initially
    isActive: 'true', // Default to active, use string for select value
  });
  // State for loading and errors/success messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Destructure form data for easier access in the form
  const { registrationNumber, type, capacity, features, isActive } = formData;

  // Generic handler for input changes
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear messages on new input
    setSuccess('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission
    setLoading(true);
    setError('');
    setSuccess('');

    // Ensure user is authenticated (has token)
    if (!token) {
      setError('Authentication required. Please log in as admin.');
      setLoading(false);
      return;
    }

    // Prepare data in the format expected by the backend API
    // Convert features string to array, trim whitespace, filter empty strings
    const featuresArray = features.split(',').map(f => f.trim()).filter(f => f !== '');
    // Convert capacity to number, isActive to boolean
    const vehicleData = {
      registrationNumber: registrationNumber.toUpperCase().trim(), // Standardize format
      type: type.trim(),
      capacity: parseInt(capacity, 10), // Convert string to number
      features: featuresArray,
      isActive: isActive === 'true', // Convert select string 'true'/'false' to boolean
    };

    // Basic client-side validation
    if (!vehicleData.registrationNumber || !vehicleData.type || !vehicleData.capacity || isNaN(vehicleData.capacity) || vehicleData.capacity < 1) {
        setError('Please fill in Registration Number, Type, and a valid positive Capacity.');
        setLoading(false);
        return;
    }

    try {
      // Call the API service function to add the vehicle
      const newVehicle = await addVehicle(vehicleData, token);
      console.log('Vehicle Added:', newVehicle);
      setSuccess('Vehicle added successfully! Redirecting back to list...');
      setLoading(false);

      // Optionally clear form after successful submission
      // setFormData({ registrationNumber: '', type: '', capacity: '', features: '', isActive: 'true' });

      // Redirect back to the vehicle list page after a short delay
      setTimeout(() => {
        navigate('/admin/vehicles'); // Redirect to the list view
      }, 2000); // 2 second delay

    } catch (err) {
      // Handle errors from the API call
      console.error('Add Vehicle Error:', err);
      setError(err.message || 'Failed to add vehicle. Please check details (e.g., duplicate registration number).');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 border rounded shadow-lg bg-white">
      <h1 className="text-3xl font-bold text-center mb-6">Add New Vehicle</h1>
      <form onSubmit={handleSubmit}>
        {/* Display Error or Success Messages */}
        {error && ( <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span>{error}</span></div> )}
        {success && ( <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert"><span>{success}</span></div> )}

        {/* Registration Number Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="registrationNumber">
            Registration Number
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline uppercase" // Apply uppercase styling
            id="registrationNumber"
            type="text"
            placeholder="e.g., UP32AB1234"
            name="registrationNumber"
            value={registrationNumber} // Bind value to state
            onChange={onChange} // Handle changes
            required // Make field required
          />
        </div>

        {/* Vehicle Type Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
            Vehicle Type
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="type"
            type="text"
            placeholder="e.g., Sedan, SUV, Tempo Traveller"
            name="type"
            value={type} // Bind value to state
            onChange={onChange} // Handle changes
            required // Make field required
          />
        </div>

        {/* Capacity Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacity">
            Capacity (Passengers)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="capacity"
            type="number"
            placeholder="e.g., 4, 7, 12"
            name="capacity"
            value={capacity} // Bind value to state
            onChange={onChange} // Handle changes
            min="1" // Minimum capacity
            required // Make field required
          />
        </div>

        {/* Features Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="features">
            Features (comma-separated)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="features"
            type="text"
            placeholder="e.g., AC, Music System, WiFi"
            name="features"
            value={features} // Bind value to state
            onChange={onChange} // Handle changes
          />
           <p className="text-xs text-gray-500 mt-1">Enter features separated by commas.</p>
        </div>

         {/* Active Status Select */}
        <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="isActive">
                Status
            </label>
            <select
                id="isActive"
                name="isActive"
                value={isActive} // Bind select value to state
                onChange={onChange} // Use standard onChange handler
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white" // Added bg-white for consistency
            >
                <option value="true">Active</option> {/* Value is string 'true' */}
                <option value="false">Inactive</option> {/* Value is string 'false' */}
            </select>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            className={`bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={loading} // Disable button while loading
          >
            {loading ? 'Saving...' : 'Add Vehicle'} {/* Change button text while loading */}
          </button>
          {/* Link to cancel and go back to the vehicle list */}
          <Link
             to="/admin/vehicles"
             className="inline-block align-baseline font-bold text-sm text-gray-600 hover:text-gray-800"
           >
             Cancel
           </Link>
        </div>
      </form>
    </div>
  );
}

export default AddVehiclePage;