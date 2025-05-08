// src/pages/admin/EditDriverPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
// Import getById and update functions from service
import { getDriverById, updateDriver } from '../../services/driverService'; // Adjust path if needed

function EditDriverPage() {
  const { id: driverId } = useParams(); // Get driver ID from URL parameter
  const { token } = useAuth();
  const navigate = useNavigate();

  // State for form fields, loading, errors, etc.
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '', // Display only, not editable
    // Add assignedVehicle if you want to display/edit it
  });
  const [initialLoading, setInitialLoading] = useState(true); // Loading initial data
  const [loading, setLoading] = useState(false); // Loading during update
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Destructure form data
  const { name, phone, licenseNumber } = formData;

  // Fetch driver data when component mounts
  const fetchDriverData = useCallback(async () => {
    if (!token || !driverId) return;
    try {
      setInitialLoading(true);
      setError('');
      const driver = await getDriverById(driverId, token);

      // Populate form state with fetched data
      setFormData({
        name: driver.name || '',
        phone: driver.phone || '',
        licenseNumber: driver.licenseNumber || '', // Store for display
        // assignedVehicle: driver.assignedVehicle?._id || '' // Example if handling vehicle assignment
      });

    } catch (err) {
      setError(err.message || 'Failed to load driver data.');
      console.error("Fetch driver error:", err);
    } finally {
      setInitialLoading(false);
    }
  }, [driverId, token]);

  useEffect(() => {
    fetchDriverData();
  }, [fetchDriverData]); // Depend on the memoized fetch function


  // Handle input changes (only for editable fields)
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
    // License number is typically not updatable via this form
    const driverDataToUpdate = {
      name: name.trim(),
      phone: phone.trim(),
      // Add assignedVehicle if managing here:
      // assignedVehicle: formData.assignedVehicle || null
    };

     // Basic client-side validation
    if (!driverDataToUpdate.name || !driverDataToUpdate.phone) {
        setError('Please fill in both Name and Phone Number.');
        setLoading(false);
        return;
    }

    try {
      // Call the update service function
      const updatedDriver = await updateDriver(driverId, driverDataToUpdate, token);
      console.log('Driver Updated:', updatedDriver);
      setSuccess('Driver updated successfully! Redirecting back to list...');
      setLoading(false);

      // Redirect back to the driver list page after a delay
      setTimeout(() => {
        navigate('/admin/drivers');
      }, 2000);

    } catch (err) {
      console.error('Update Driver Error:', err);
      setError(err.message || 'Failed to update driver.');
      setLoading(false);
    }
  };

  // Show loading indicator while fetching initial data
  if (initialLoading) {
    return <p>Loading driver details...</p>;
  }

  // Show error if initial fetch failed
  if (error && !formData.licenseNumber) { // Check if error occurred before data loaded
     return <p className="text-red-600 bg-red-100 p-3 rounded">Error: {error}</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 border rounded shadow-lg bg-white">
      <h1 className="text-3xl font-bold text-center mb-6">Edit Driver</h1>
      {/* Display License Number (non-editable) */}
      <p className="text-center text-gray-600 mb-4">License Number: <span className="font-mono font-semibold">{licenseNumber}</span></p>

      <form onSubmit={handleSubmit}>
        {/* Display Error or Success Messages */}
        {error && ( <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span>{error}</span></div> )}
        {success && ( <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert"><span>{success}</span></div> )}

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Driver Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name" type="text" placeholder="Enter driver's full name" name="name"
            value={name} onChange={onChange} required
          />
        </div>

        {/* Phone Input */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
            Phone Number
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="phone" type="tel" placeholder="e.g., 9xxxxxxxxx" name="phone"
            value={phone} onChange={onChange} required
          />
        </div>

        {/* Add Assigned Vehicle select/input here if needed */}

        {/* Form Action Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            className={`bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit" disabled={loading}
          >
            {loading ? 'Saving...' : 'Update Driver'}
          </button>
          <Link
             to="/admin/drivers"
             className="inline-block align-baseline font-bold text-sm text-gray-600 hover:text-gray-800"
           >
             Cancel
           </Link>
        </div>
      </form>
    </div>
  );
}

export default EditDriverPage;
