// src/pages/admin/ManageBookingsPage.jsx (Complete with Filters & Assign)
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
import { getAllAdminBookings } from '../../services/bookingService'; // Adjust path if needed
import { Link } from 'react-router-dom'; // For potential detail links later
// Import the modal component
import AssignBookingModal from '../../components/admin/AssignBookingModal'; // Adjust path if needed

// Helper function to format date/time nicely
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  try {
    return new Date(dateTimeString).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
  } catch (e) { return 'Invalid Date'; }
};

// Helper function for status colors
const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'text-green-700 bg-green-100';
      case 'Pending': return 'text-yellow-700 bg-yellow-100';
      case 'Ongoing': return 'text-blue-700 bg-blue-100';
      case 'Completed': return 'text-gray-700 bg-gray-100';
      case 'Cancelled': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
};

// Define possible booking statuses based on schema
const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'];

function ManageBookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(15); // Items per page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- State for Modal ---
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // --- State for Filters ---
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  // -----------------------

  // Fetch bookings function, includes all filters
  const fetchAdminBookings = useCallback(async (pageToFetch, currentFilters) => {
    if (!token) { setError('Authentication required.'); setLoading(false); return; }

    // Prepare filters object - include status and dates if they exist
    const filters = {};
    if (currentFilters.status) { filters.status = currentFilters.status; }
    if (currentFilters.startDate) { filters.startDate = currentFilters.startDate; }
    if (currentFilters.endDate) { filters.endDate = currentFilters.endDate; }

    setLoading(true);
    setError('');
    try {
      // Pass token, page, limit, and the combined filters object
      const data = await getAllAdminBookings(token, pageToFetch, limit, filters);
      setBookings(data.bookings || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings.');
      console.error("Fetch admin bookings error:", err);
      setBookings([]); setPagination({});
    } finally {
      setLoading(false);
    }
  }, [token, limit]);

  // useEffect hook to fetch bookings when filters or page change
  useEffect(() => {
    const currentFilters = {
        status: statusFilter,
        startDate: startDateFilter,
        endDate: endDateFilter,
    };
    fetchAdminBookings(currentPage, currentFilters);
  }, [fetchAdminBookings, currentPage, statusFilter, startDateFilter, endDateFilter]);

  // Handler for changing status filter
  const handleStatusFilterChange = (e) => {
      setStatusFilter(e.target.value);
      setCurrentPage(1); // Reset page on filter change
  };

  // Handlers for changing date filters
  const handleStartDateChange = (e) => {
      setStartDateFilter(e.target.value);
      setCurrentPage(1); // Reset page on filter change
  };
  const handleEndDateChange = (e) => {
      setEndDateFilter(e.target.value);
      setCurrentPage(1); // Reset page on filter change
  };

  // Pagination handlers
  const handleNextPage = () => { if (currentPage < pagination.totalPages) { setCurrentPage(prevPage => prevPage + 1); } };
  const handlePreviousPage = () => { if (currentPage > 1) { setCurrentPage(prevPage => prevPage - 1); } };

  // Modal Handlers
  const openAssignModal = (booking) => { setSelectedBooking(booking); setShowAssignModal(true); };
  const handleCloseModal = () => { setShowAssignModal(false); setSelectedBooking(null); };
  const handleAssignmentSuccess = (updatedBooking) => {
    // Update the booking list locally
    setBookings(prevBookings =>
      prevBookings.map(b =>
        b._id === updatedBooking._id ? updatedBooking : b
      )
    );
    handleCloseModal();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Manage All Bookings</h1>
        {/* --- Filter Controls Area --- */}
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
            {/* Status Filter */}
            <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">Status:</label>
                <select id="statusFilter" name="statusFilter" value={statusFilter} onChange={handleStatusFilterChange} className="mt-1 block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white border">
                    <option value="">All</option>
                    {BOOKING_STATUSES.map(status => (<option key={status} value={status}>{status}</option>))}
                </select>
            </div>
             {/* Start Date Filter */}
            <div>
                <label htmlFor="startDateFilter" className="block text-sm font-medium text-gray-700">From Date:</label>
                <input type="date" id="startDateFilter" name="startDateFilter" value={startDateFilter} onChange={handleStartDateChange} className="mt-1 block w-full pl-3 pr-2 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white border"/>
            </div>
             {/* End Date Filter */}
            <div>
                <label htmlFor="endDateFilter" className="block text-sm font-medium text-gray-700">To Date:</label>
                <input type="date" id="endDateFilter" name="endDateFilter" value={endDateFilter} onChange={handleEndDateChange} min={startDateFilter || ''} className="mt-1 block w-full pl-3 pr-2 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white border"/>
            </div>
        </div>
        {/* -------------------------- */}
      </div>

      {/* Loading/Error Messages */}
      {loading && <p>Loading bookings...</p>}
      {error && <p className="text-red-600 bg-red-100 p-3 rounded mb-4">Error: {error}</p>}

      {/* Bookings Table */}
      {!loading && !error && (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white align-top">
             <thead className="bg-gray-200">
                 <tr>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travel Date</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pax</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-gray-200">
                {bookings.length === 0 ? (
                    <tr><td colSpan="9" className="px-6 py-4 text-center text-gray-500">No bookings found matching criteria.</td></tr>
                 ) : (
                     bookings.map((booking) => {
                         const canAssign = booking.status === 'Pending' || booking.status === 'Confirmed';
                         return (
                             <tr key={booking._id} className="hover:bg-gray-50">
                                 <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.user?.name || 'N/A'}</td>
                                 <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{booking.user?.phone || booking.user?.email || 'N/A'}</td>
                                 <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(booking.travelDateTime)}</td>
                                 <td className="px-4 py-4 text-sm text-gray-700"><div className="text-xs">From: {booking.pickupLocation?.address}</div><div className="text-xs">To: {booking.dropLocation?.address}</div></td>
                                 <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{booking.passengers}</td>
                                 <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{booking.vehicle ? `${booking.vehicle.type} (${booking.vehicle.registrationNumber})` : 'Not Assigned'}</td>
                                 <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{booking.driver ? `${booking.driver.name}` : 'Not Assigned'}</td>
                                 <td className="px-4 py-4 whitespace-nowrap text-sm text-center"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>{booking.status}</span></td>
                                 <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-right">
                                     {canAssign ? ( <button onClick={() => openAssignModal(booking)} className="text-blue-600 hover:text-blue-900 text-xs font-semibold"> Assign V/D </button> ) : ( <span className="text-gray-400 text-xs italic">N/A</span> )}
                                 </td>
                             </tr>
                         );
                     })
                 )}
             </tbody>
          </table>
        </div>
      )}

       {/* Pagination Controls */}
       {!loading && !error && pagination.totalPages > 1 && (
         <div className="flex justify-between items-center mt-4">
            <button onClick={handlePreviousPage} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <span>Page {currentPage} of {pagination.totalPages}</span>
            <button onClick={handleNextPage} disabled={currentPage === pagination.totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
         </div>
       )}

       {/* Conditionally Render the Modal */}
       {showAssignModal && selectedBooking && (
           <AssignBookingModal
             booking={selectedBooking}
             onClose={handleCloseModal}
             onSuccess={handleAssignmentSuccess}
           />
       )}

    </div>
  );
}

export default ManageBookingsPage;
