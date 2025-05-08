// src/pages/admin/ManageDriversPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
// Import getAllDrivers and deleteDriver service functions
import { getAllDrivers, deleteDriver } from '../../services/driverService'; // Adjust path if needed
import { Link } from 'react-router-dom'; // Import Link

function ManageDriversPage() {
  const { token } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State to track which driver is being deleted (for button loading state)
  const [deletingId, setDeletingId] = useState(null);

  // Memoized fetch function
  const fetchDrivers = useCallback(async () => {
    if (!token) { setError('Authentication required.'); setLoading(false); return; }
    try {
      setLoading(true); setError('');
      const data = await getAllDrivers(token);
      setDrivers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch drivers.');
      console.error("Fetch drivers error:", err);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch data on mount/token change
  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Handler for deleting a driver
  const handleDelete = async (driverId, driverName) => {
    // Confirmation dialog
    if (!window.confirm(`Are you sure you want to delete driver: ${driverName} (ID: ${driverId})? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(driverId); // Set loading state for the specific delete button
    setError(''); // Clear general page errors

    try {
      await deleteDriver(driverId, token); // Call the service function

      // Remove the driver from the local state for immediate UI update
      setDrivers(prevDrivers => prevDrivers.filter(d => d._id !== driverId));
      // Optionally show a success notification

    } catch (err) {
      console.error(`Delete Driver Error (${driverId}):`, err);
      setError(err.message || 'Failed to delete driver.'); // Show error message
    } finally {
      setDeletingId(null); // Reset loading state for the button
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Drivers</h1>
        <Link
          to="/admin/drivers/new"
          className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
        >
          + Add New Driver
        </Link>
      </div>

      {/* Loading/Error Messages */}
      {loading && <p>Loading drivers...</p>}
      {/* Display general error, hide if a specific delete operation is in progress/failed */}
      {error && !deletingId && <p className="text-red-600 bg-red-100 p-3 rounded mb-4">Error: {error}</p>}

      {/* Driver Table */}
      {!loading && ( // Render table even if there's an error
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white align-top">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.length === 0 && !error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No drivers found.</td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50">
                    {/* ... other data cells ... */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{driver.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{driver.licenseNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {driver.assignedVehicle ? `${driver.assignedVehicle.type} (${driver.assignedVehicle.registrationNumber})` : 'N/A'}
                    </td>
                    {/* Actions Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      {/* Edit Link */}
                      <Link
                        to={`/admin/drivers/edit/${driver._id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </Link>
                      {/* --- Add Delete Button --- */}
                      <button
                        onClick={() => handleDelete(driver._id, driver.name)} // Call handleDelete with ID and name
                        disabled={deletingId === driver._id} // Disable only the button being clicked
                        className={`text-red-600 hover:text-red-900 ${deletingId === driver._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {deletingId === driver._id ? 'Deleting...' : 'Delete'}
                      </button>
                      {/* ----------------------- */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Display specific delete error if it occurred */}
      {error && deletingId && <p className="text-red-600 bg-red-100 p-3 rounded mt-4">Error deleting driver: {error}</p>}
    </div>
  );
}

export default ManageDriversPage;
