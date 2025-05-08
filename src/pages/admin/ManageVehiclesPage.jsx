// src/pages/admin/ManageVehiclesPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
// Import all needed service functions
import { getAllVehicles, deleteVehicle } from '../../services/vehicleService'; // Adjust path if needed
import { Link } from 'react-router-dom'; // Import Link for navigation

function ManageVehiclesPage() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State to track which vehicle is being deleted (for loading state on button)
  const [deletingId, setDeletingId] = useState(null);

  // Memoize fetchVehicles to avoid unnecessary re-renders if passed as prop later
  const fetchVehicles = useCallback(async () => {
    if (!token) { setError('Authentication required.'); setLoading(false); return; }
    try { setLoading(true); setError(''); const data = await getAllVehicles(token); setVehicles(data);
    } catch (err) { setError(err.message || 'Failed to fetch vehicles.'); console.error("Fetch vehicles error:", err); setVehicles([]); // Ensure it's an array on error
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]); // Use memoized function

  // Handler for deleting a vehicle
  const handleDelete = async (vehicleId, registrationNumber) => {
    // Confirmation dialog
    if (!window.confirm(`Are you sure you want to delete vehicle: ${registrationNumber} (ID: ${vehicleId})? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(vehicleId); // Set loading state for this specific button
    setError(''); // Clear previous general errors

    try {
      await deleteVehicle(vehicleId, token); // Call the service function

      // Remove the vehicle from the local state for immediate UI update
      setVehicles(prevVehicles => prevVehicles.filter(v => v._id !== vehicleId));
      // Optionally show a success message (e.g., using a toast notification library)

    } catch (err) {
      console.error(`Delete Vehicle Error (${vehicleId}):`, err);
      setError(err.message || 'Failed to delete vehicle.'); // Show error message
    } finally {
      setDeletingId(null); // Reset loading state for the button
    }
  };


  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Vehicles</h1>
        <Link
          to="/admin/vehicles/new"
          className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
        >
          + Add New Vehicle
        </Link>
      </div>

      {/* Loading/Error Messages */}
      {loading && <p>Loading vehicles...</p>}
      {/* Display general error, hide if a specific delete operation is in progress/failed */}
      {error && !deletingId && <p className="text-red-600 bg-red-100 p-3 rounded mb-4">Error: {error}</p>}

      {/* Vehicle Table */}
      {!loading && ( // Render table even if there's an error, just show error message above
        <div className="overflow-x-auto shadow-md rounded-lg">
          {/* Ensure no extra whitespace between table and thead/tbody */}
          <table className="min-w-full bg-white align-top"><thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead><tbody className="divide-y divide-gray-200">
              {vehicles.length === 0 && !error ? ( // Show only if no error and no vehicles
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No vehicles found.</td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="hover:bg-gray-50">
                    {/* ... other data cells ... */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.registrationNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{vehicle.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{vehicle.capacity}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{vehicle.features?.join(', ') || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {vehicle.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {/* Actions Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <Link
                        to={`/admin/vehicles/edit/${vehicle._id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </Link>
                      {/* --- Add Delete Button --- */}
                      <button
                        onClick={() => handleDelete(vehicle._id, vehicle.registrationNumber)}
                        disabled={deletingId === vehicle._id} // Disable only the button being clicked
                        className={`text-red-600 hover:text-red-900 ${deletingId === vehicle._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {deletingId === vehicle._id ? 'Deleting...' : 'Delete'}
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
      {error && deletingId && <p className="text-red-600 bg-red-100 p-3 rounded mt-4">Error deleting vehicle: {error}</p>}
    </div>
  );
}

export default ManageVehiclesPage;
