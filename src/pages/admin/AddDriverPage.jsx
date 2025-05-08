// src/pages/admin/AddDriverPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
import { addDriver } from '../../services/driverService'; // Adjust path if needed

function AddDriverPage() {
  const { token } = useAuth(); // Get token for API call
  const navigate = useNavigate(); // To redirect after success

  // State for form fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
  });
  // State for loading and errors/success messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Destructure form data for easier access in the form
  const { name, phone, licenseNumber } = formData;

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
    const driverData = {
      name: name.trim(),
      phone: phone.trim(),
      licenseNumber: licenseNumber.toUpperCase().trim(), // Standardize format
    };

    // Basic client-side validation
    if (!driverData.name || !driverData.phone || !driverData.licenseNumber) {
        setError('Please fill in all required fields: Name, Phone, and License Number.');
        setLoading(false);
        return;
    }
    // Add more specific validation if needed (e.g., phone format, license format)

    try {
      // Call the API service function to add the driver
      const newDriver = await addDriver(driverData, token);
      console.log('Driver Added:', newDriver);
      setSuccess('Driver added successfully! Redirecting back to list...');
      setLoading(false);

      // Optionally clear form after successful submission
      // setFormData({ name: '', phone: '', licenseNumber: '' });

      // Redirect back to the driver list page after a short delay
      setTimeout(() => {
        navigate('/admin/drivers'); // Redirect to the list view
      }, 2000); // 2 second delay

    } catch (err) {
      // Handle errors from the API call
      console.error('Add Driver Error:', err);
      setError(err.message || 'Failed to add driver. Please check details (e.g., duplicate phone or license).');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 border rounded shadow-lg bg-white">
      <h1 className="text-3xl font-bold text-center mb-6">Add New Driver</h1>
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
            id="name"
            type="text"
            placeholder="Enter driver's full name"
            name="name"
            value={name} // Bind value to state
            onChange={onChange} // Handle changes
            required // Make field required
          />
        </div>

        {/* Phone Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
            Phone Number
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="phone"
            type="tel" // Use 'tel' type for phone numbers
            placeholder="e.g., 9xxxxxxxxx"
            name="phone"
            value={phone} // Bind value to state
            onChange={onChange} // Handle changes
            required // Make field required
          />
        </div>

        {/* License Number Input */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="licenseNumber">
            License Number
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline uppercase" // Often uppercase
            id="licenseNumber"
            type="text"
            placeholder="e.g., DL1420200012345"
            name="licenseNumber"
            value={licenseNumber} // Bind value to state
            onChange={onChange} // Handle changes
            required // Make field required
          />
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            className={`bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={loading} // Disable button while loading
          >
            {loading ? 'Saving...' : 'Add Driver'} {/* Change button text while loading */}
          </button>
          {/* Link to cancel and go back to the driver list */}
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

export default AddDriverPage;
