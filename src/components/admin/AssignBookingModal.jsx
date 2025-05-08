// src/components/admin/AssignBookingModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
// Import necessary service functions
import { getAllVehicles } from '../../services/vehicleService'; // Adjust path if needed
import { getAllDrivers } from '../../services/driverService'; // Adjust path if needed
import { assignToBooking } from '../../services/bookingService'; // Adjust path if needed

// Helper function to format date/time nicely
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  try {
    return new Date(dateTimeString).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch (e) { return 'Invalid Date'; }
};


// Props: booking (object), onClose (function), onSuccess (function)
function AssignBookingModal({ booking, onClose, onSuccess }) {
  const { token } = useAuth();

  // State for fetched data
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // State for selected values in dropdowns
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');

  // State for loading and errors within the modal
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [error, setError] = useState('');

  // Fetch vehicles and drivers when the modal opens (based on booking prop)
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !booking) return; // Don't fetch if no token or booking selected

      setLoadingLists(true);
      setError('');
      try {
        // Fetch both lists concurrently
        const [vehiclesData, driversData] = await Promise.all([
          getAllVehicles(token), // Fetch all vehicles
          getAllDrivers(token)   // Fetch all drivers
        ]);
        // TODO: Filter lists for *available* vehicles/drivers based on capacity/schedule (complex)
        // For now, just show all active ones
        setVehicles(vehiclesData.filter(v => v.isActive) || []);
        setDrivers(driversData || []); // Assuming drivers don't have an isActive field yet

        // Pre-select if already assigned
        setSelectedVehicleId(booking.vehicle?._id || '');
        setSelectedDriverId(booking.driver?._id || '');

      } catch (err) {
        console.error("Error fetching vehicles/drivers for modal:", err);
        setError(err.message || 'Failed to load vehicles or drivers.');
      } finally {
        setLoadingLists(false);
      }
    };

    fetchData();
  }, [token, booking]); // Re-fetch if the selected booking changes

  // Handle assignment submission
  const handleAssign = async (e) => {
    e.preventDefault();
    setLoadingAssign(true);
    setError('');

    if (!selectedVehicleId && !selectedDriverId) {
        setError('Please select at least a vehicle or a driver to assign.');
        setLoadingAssign(false);
        return;
    }

    const assignmentData = {
        // Include ID only if it's selected (and not empty string)
        ...(selectedVehicleId && { vehicleId: selectedVehicleId }),
        ...(selectedDriverId && { driverId: selectedDriverId }),
    };

    try {
        const updatedBooking = await assignToBooking(booking._id, assignmentData, token);
        setLoadingAssign(false);
        onSuccess(updatedBooking); // Notify parent component of success
        onClose(); // Close the modal

    } catch (err) {
        console.error("Error assigning booking:", err);
        setError(err.message || 'Failed to assign.');
        setLoadingAssign(false);
    }
  };


  // Basic Modal Structure (improve styling as needed)
  return (
    // Modal backdrop
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      {/* Modal content */}
      <div className="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Assign to Booking</h3>
          <button
            onClick={onClose} // Close button calls the onClose prop
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="mb-4 text-sm">
            <p><strong>Booking ID:</strong> {booking?._id}</p>
            <p><strong>User:</strong> {booking?.user?.name} ({booking?.user?.phone || booking?.user?.email})</p>
            <p><strong>Route:</strong> {booking?.pickupLocation?.address} to {booking?.dropLocation?.address}</p>
            <p><strong>Date:</strong> {formatDateTime(booking?.travelDateTime)}</p>
            <p><strong>Passengers:</strong> {booking?.passengers}</p>
        </div>

        {/* Loading/Error for dropdowns */}
        {loadingLists && <p>Loading available vehicles and drivers...</p>}
        {error && !loadingLists && <p className="text-red-600 bg-red-100 p-2 rounded text-sm mb-4">Error: {error}</p>}

        {/* Assignment Form */}
        {!loadingLists && (
            <form onSubmit={handleAssign}>
                {/* Vehicle Dropdown */}
                <div className="mb-4">
                    <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 mb-1">Assign Vehicle</label>
                    <select
                        id="vehicle"
                        name="vehicleId"
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white border"
                    >
                        <option value="">-- Select Vehicle (Optional) --</option>
                        {vehicles.map(v => (
                            // TODO: Add more checks? e.g., capacity >= booking.passengers
                            <option key={v._id} value={v._id}>
                                {v.type} - {v.registrationNumber} (Cap: {v.capacity})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Driver Dropdown */}
                <div className="mb-6">
                    <label htmlFor="driver" className="block text-sm font-medium text-gray-700 mb-1">Assign Driver</label>
                    <select
                        id="driver"
                        name="driverId"
                        value={selectedDriverId}
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white border"
                    >
                        <option value="">-- Select Driver (Optional) --</option>
                        {drivers.map(d => (
                             // TODO: Add more checks? e.g., driver availability
                            <option key={d._id} value={d._id}>
                                {d.name} ({d.phone})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 border-t pt-4">
                    <button
                        type="button" // Important: type="button" to prevent form submission
                        onClick={onClose}
                        className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-200"
                        disabled={loadingAssign}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`py-2 px-4 bg-accent hover:bg-accent-hover text-white rounded transition duration-200 ${loadingAssign ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loadingAssign || (!selectedVehicleId && !selectedDriverId)} // Disable if nothing selected or loading
                    >
                        {loadingAssign ? 'Assigning...' : 'Confirm Assignment'}
                    </button>
                </div>
            </form>
        )}

      </div>
    </div>
  );
}

export default AssignBookingModal;
