// src/components/BookingListItem.jsx
import React, { useState } from 'react';

// Helper function to format date/time nicely
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  try {
    return new Date(dateTimeString).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch (e) { return 'Invalid Date'; }
};

// Helper function for status colors
const getStatusColor = (status) => { /* ... same as before ... */ };

// Add onPayOnline prop
function BookingListItem({ booking, onCancel, onPayOnline }) {
  const [isCancelling, setIsCancelling] = useState(false);
  // Add loading state for payment button if needed
  // const [isPaying, setIsPaying] = useState(false);

  const handleCancelClick = async () => { /* ... same as before ... */ };

  // Determine if the booking is cancellable by the user via UI rules
  const isCancellable = booking.status === 'Pending' || booking.status === 'Confirmed';
  // Determine if online payment is possible/needed
  const canPayOnline = (booking.status === 'Pending' || booking.status === 'Confirmed') &&
                       booking.paymentMethod === 'Online' && // Check if user chose Online payment
                       booking.paymentStatus !== 'Success'; // Check if not already paid

  return (
    <li className="border rounded-lg p-4 mb-4 shadow hover:shadow-md transition-shadow duration-200 bg-white">
      {/* ... Booking ID, Status, Details ... */}
      <div className="flex justify-between items-start mb-2">
         <h3 className="text-lg font-semibold">Booking ID: <span className="font-normal text-sm text-gray-500">{booking._id}</span></h3>
         <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>{booking.status}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
         <p><strong>From:</strong> {booking.pickupLocation?.address || 'N/A'}</p>
         <p><strong>To:</strong> {booking.dropLocation?.address || 'N/A'}</p>
         <p><strong>Travel Date:</strong> {formatDateTime(booking.travelDateTime)}</p>
         <p><strong>Passengers:</strong> {booking.passengers}</p>
         {booking.vehicle && (<p><strong>Vehicle:</strong> {booking.vehicle?.type} ({booking.vehicle?.registrationNumber})</p>)}
         {booking.driver && (<p><strong>Driver:</strong> {booking.driver?.name} ({booking.driver?.phone})</p>)}
         <p><strong>Payment:</strong> {booking.paymentMethod || 'N/A'} ({booking.paymentStatus || 'N/A'})</p>
         <p><strong>Fare:</strong> {booking.fare ? `₹${booking.fare.toFixed(2)}` : 'N/A'}</p> {/* Display Fare */}
      </div>
      {/* --- Action Buttons Area --- */}
      <div className="mt-3 text-right space-x-2"> {/* Use space-x for button spacing */}
          {/* --- Pay Online Button --- */}
          {canPayOnline && (
              <button
                onClick={() => onPayOnline(booking)} // Pass the whole booking object
                // disabled={isPaying} // Add loading state later
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline transition duration-200"
              >
                {/* {isPaying ? 'Processing...' : 'Pay Online'} */}
                Pay Online
              </button>
          )}
          {/* --- Cancel Button --- */}
          {isCancellable && (
            <button
              onClick={handleCancelClick}
              disabled={isCancelling}
              className={`bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline transition duration-200 ${isCancelling ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
      </div>
      {/* --------------------------- */}
    </li>
  );
}

export default BookingListItem;
