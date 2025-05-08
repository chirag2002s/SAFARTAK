// src/pages/admin/EditVehiclePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
// Import getById and update functions from service
import { getVehicleById, updateVehicle } from '../../services/vehicleService'; // Adjust path if needed

function EditVehiclePage() {
  const { id: vehicleId } = useParams(); // Get vehicle ID from URL parameter
  const { token } = useAuth();
  const navigate = useNavigate();

  // State for form fields, loading, errors, etc.
  const [formData, setFormData] = useState({
    registrationNumber: '', // Usually not editable, display only
    type: '',
    capacity: '',
    features: '', // Store as comma-separated string for input
    isActive: 'true',
  });
  const [initialLoading, setInitialLoading] = useState(true); // Loading initial data
  const [loading, setLoading] = useState(false); // Loading during update
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Destructure form data
  const { registrationNumber, type, capacity, features, isActive } = formData;

  // Fetch vehicle data when component mounts
  const fetchVehicleData = useCallback(async () => {
    if (!token || !vehicleId) return;
    try {
      setInitialLoading(true);
      setError('');
      const vehicle = await getVehicleById(vehicleId, token);

      // Populate form state with fetched data
      setFormData({
        registrationNumber: vehicle.registrationNumber || '',
        type: vehicle.type || '',
        capacity: vehicle.capacity?.toString() || '', // Convert number to string for input
        features: vehicle.features?.join(', ') || '', // Convert array to comma-separated string
        isActive: vehicle.isActive ? 'true' : 'false', // Convert boolean to string for select
      });

    } catch (err) {
      setError(err.message || 'Failed to load vehicle data.');
      console.error("Fetch vehicle error:", err);
    } finally {
      setInitialLoading(false);
    }
  }, [vehicleId, token]);

  useEffect(() => {
    fetchVehicleData();
  }, [fetchVehicleData]); // Depend on the memoized fetch function


  // Handle input changes
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!token) {
      setError('Authentication required.');
      setLoading(false);
      return;
    }

    // Prepare data for API (only send fields that can be updated)
    const featuresArray = features.split(',').map(f => f.trim()).filter(f => f !== '');
    const vehicleDataToUpdate = {
      // registrationNumber is usually not updated
      type: type.trim(),
      capacity: parseInt(capacity, 10),
      features: featuresArray,
      isActive: isActive === 'true',
    };

     // Basic client-side validation
    if (!vehicleDataToUpdate.type || !vehicleDataToUpdate.capacity || isNaN(vehicleDataToUpdate.capacity) || vehicleDataToUpdate.capacity < 1) {
        setError('Please fill in Type and a valid positive Capacity.');
        setLoading(false);
        return;
    }


    try {
      // Call the update service function
      const updatedVehicle = await updateVehicle(vehicleId, vehicleDataToUpdate, token);
      console.log('Vehicle Updated:', updatedVehicle);
      setSuccess('Vehicle updated successfully! Redirecting back to list...');
      setLoading(false);

      // Redirect back to the vehicle list page after a delay
      setTimeout(() => {
        navigate('/admin/vehicles');
      }, 2000);

    } catch (err) {
      console.error('Update Vehicle Error:', err);
      setError(err.message || 'Failed to update vehicle.');
      setLoading(false);
    }
  };

  // Show loading indicator while fetching initial data
  if (initialLoading) {
    return <p>Loading vehicle details...</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 border rounded shadow-lg bg-white">
      <h1 className="text-3xl font-bold text-center mb-6">Edit Vehicle</h1>
      {/* Display Registration Number (usually non-editable) */}
      <p className="text-center text-gray-600 mb-4">Registration: <span className="font-mono font-semibold">{registrationNumber}</span></p>

      <form onSubmit={handleSubmit}>
        {/* Display Error or Success Messages */}
        {error && ( <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span>{error}</span></div> )}
        {success && ( <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert"><span>{success}</span></div> )}

        {/* Vehicle Type Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
            Vehicle Type
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="type" type="text" placeholder="e.g., Sedan, SUV" name="type"
            value={type} onChange={onChange} required
          />
        </div>

        {/* Capacity Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacity">
            Capacity (Passengers)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="capacity" type="number" placeholder="e.g., 4, 7" name="capacity"
            value={capacity} onChange={onChange} min="1" required
          />
        </div>

        {/* Features Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="features">
            Features (comma-separated)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="features" type="text" placeholder="e.g., AC, Music System" name="features"
            value={features} onChange={onChange}
          />
           <p className="text-xs text-gray-500 mt-1">Enter features separated by commas.</p>
        </div>

         {/* Active Status Select */}
        <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="isActive">
                Status
            </label>
            <select
                id="isActive" name="isActive" value={isActive} onChange={onChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
            >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
            </select>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            className={`bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit" disabled={loading}
          >
            {loading ? 'Saving...' : 'Update Vehicle'}
          </button>
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

export default EditVehiclePage;
