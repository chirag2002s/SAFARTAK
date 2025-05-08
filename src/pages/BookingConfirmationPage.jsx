// src/pages/BookingConfirmationPage.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Optional: If needed for user info
import { format, parseISO } from 'date-fns';
// *** Import User icon ***
import { CheckCircle, Ticket, Download, XCircle, Calendar, Clock, MapPin, Users, IndianRupee, Bus, ArrowLeft, ArrowRightLeft, X, User } from 'lucide-react';

// Helper Functions (can be moved to a utils file)
const formatDate = (dateString, fmt = 'eee, dd MMM yy') => { // Added default format
    try {
        if (!dateString || typeof dateString !== 'string') throw new Error("Invalid date string");
        return format(parseISO(dateString), fmt);
    } catch(e) {
        console.error("Error formatting date:", dateString, e);
        return "Invalid Date";
     }
};
const formatTime = (timeString) => {
     try {
        if (!timeString || typeof timeString !== 'string') throw new Error("Invalid time string");
        return format(parseISO(timeString), 'h:mm a'); // e.g., 10:00 AM
     } catch(e) {
        console.error("Error formatting time:", timeString, e);
        return "Invalid Time";
     }
};
const getCityAbbreviation = (cityName = '') => {
    if (!cityName) return 'N/A';
    return cityName.substring(0, 3).toUpperCase();
};

function BookingConfirmationPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading: authLoading } = useAuth(); // Get user if needed

    // *** Correctly access 'bookingDetails' from location state ***
    const bookingDetails = location.state?.bookingDetails;

    // Log received data for debugging
    useEffect(() => {
        console.log("Booking data received on Confirmation Page:", bookingDetails);
        if (!bookingDetails) {
            console.error("Booking data missing on confirmation page.");
            // Optionally redirect if data is absolutely required
            // Use a timeout to allow user to potentially see an error message first
            // const timer = setTimeout(() => navigate('/my-bookings', { replace: true }), 3000);
            // return () => clearTimeout(timer);
        }
    }, [bookingDetails, navigate]);

    // Placeholder function for PDF download
    const handleDownloadPdf = () => {
        alert("PDF download functionality not implemented yet.");
    };

    // Placeholder function for Cancel Ticket
    const handleCancelTicket = () => {
        // TODO: Implement cancel booking logic using bookingDetails._id and token
        if (window.confirm('Are you sure you want to cancel this booking? Cancellation fees may apply.')) {
            alert(`Cancel functionality for booking ${bookingDetails?._id} not implemented yet.`);
            // Example:
            // try {
            //   await cancelBooking(bookingDetails._id, token);
            //   alert('Booking cancelled.');
            //   navigate('/my-bookings');
            // } catch (err) { alert(`Error: ${err.message}`); }
        }
    };


    // --- Render Logic ---

    // 1. Show loading indicator while AuthContext is initializing
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // 2. Render error/redirect if booking data is missing (after auth loading is done)
    if (!bookingDetails || !bookingDetails._id) { // Check for bookingDetails and its ID
         return (
             <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
                 <XCircle size={48} className="text-red-500 mb-4" />
                 <h2 className="text-2xl font-semibold text-red-700 mb-3">Booking Data Missing</h2>
                 <p className="text-gray-600 mb-6">We couldn't load the details for this booking. Please check your bookings list or start again.</p>
                 <div className="flex gap-4">
                     <Link to="/my-bookings" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"> My Bookings </Link>
                     <Link to="/new-booking" className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"> New Booking </Link>
                 </div>
             </div>
         );
     }

    // --- Extract data safely from bookingDetails ---
    const {
        _id: bookingId,
        schedule, // Expecting this to be populated by the backend OR passed fully in state
        numberOfSeats,
        seats = [], // Use seats field if available, default to empty array
        passengerDetails = [],
        fare, // Use fare if totalFare isn't passed/available
        totalFare = fare || 0, // Default to fare if totalFare missing
        status = 'Confirmed', // Default status if missing
        paymentMethod = 'N/A',
        paymentStatus = 'N/A',
        boardingPointId = 'N/A', // Use IDs passed in payload
        deboardingPointId = 'N/A',
    } = bookingDetails;

    // Safely access nested properties
    const origin = schedule?.routeOrigin || bookingDetails.origin || 'N/A';
    const destination = schedule?.routeDestination || bookingDetails.destination || 'N/A';
    const departureDateTime = schedule?.departureDateTime || bookingDetails.departureTime;
    const arrivalDateTime = schedule?.arrivalDateTime || bookingDetails.arrivalTime;
    const vehicleModel = schedule?.vehicle?.model || bookingDetails.vehicle?.model || 'N/A';
    const seatNumbers = seats.join(', ') || 'N/A'; // Use the 'seats' array
    const passengerCount = passengerDetails.length || numberOfSeats || 0;
    const primaryPassengerName = passengerDetails[0]?.name || user?.name || 'Guest';


    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 py-8 px-4">
            <div className="container mx-auto max-w-2xl">
                {/* Back Button */}
                 <button
                    onClick={() => navigate('/my-bookings')} // Navigate to booking list
                    className="flex items-center text-sm text-primary hover:text-primary-dark mb-4"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to My Bookings
                </button>

                {/* Confirmation Card */}
                <div className="bg-white rounded-xl shadow-xl border border-green-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 text-white text-center">
                        <CheckCircle size={48} className="mx-auto mb-3" />
                        <h1 className="text-2xl font-bold mb-1">Booking Confirmed!</h1>
                        <p className="text-sm opacity-90">Your seat(s) are reserved. Happy travels!</p>
                        {/* Display Booking ID */}
                        {bookingId && !bookingId.startsWith('dummy') && (
                             <p className="text-xs mt-2 opacity-80 font-mono">Booking ID: {bookingId}</p>
                        )}
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-5">
                        {/* Route & Date */}
                        <div className="pb-4 border-b">
                             <h2 className="text-lg font-semibold text-gray-800 mb-2">{origin} <ArrowRightLeft size={16} className="inline mx-1 opacity-70"/> {destination}</h2>
                             <div className="flex items-center text-sm text-gray-600">
                                 <Calendar size={16} className="mr-2 text-gray-500" />
                                 <span>{formatDate(departureDateTime)}</span>
                             </div>
                        </div>

                        {/* Timing & Vehicle */}
                        <div className="pb-4 border-b">
                             <h3 className="text-md font-semibold text-gray-700 mb-2">Trip Details</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                 <div className="flex items-center">
                                     <Clock size={16} className="mr-2 text-gray-500 flex-shrink-0"/>
                                     <span>Departs: <span className="font-medium">{formatTime(departureDateTime)}</span></span>
                                 </div>
                                 <div className="flex items-center">
                                     <Clock size={16} className="mr-2 text-gray-500 flex-shrink-0"/>
                                     <span>Arrives: <span className="font-medium">{formatTime(arrivalDateTime)}</span></span>
                                 </div>
                                 <div className="flex items-center sm:col-span-2">
                                     <Bus size={16} className="mr-2 text-gray-500 flex-shrink-0"/>
                                     <span>Vehicle: <span className="font-medium">{vehicleModel}</span></span>
                                 </div>
                             </div>
                        </div>

                        {/* Passenger & Seat Info */}
                        <div className="pb-4 border-b">
                             <h3 className="text-md font-semibold text-gray-700 mb-2">Booking Info</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                 <div className="flex items-center">
                                     <Users size={16} className="mr-2 text-gray-500 flex-shrink-0"/>
                                     <span>Passengers: <span className="font-medium">{passengerCount}</span></span>
                                 </div>
                                 <div className="flex items-center">
                                     {/* *** Use the imported User icon *** */}
                                     <User size={16} className="mr-2 text-gray-500 flex-shrink-0"/>
                                     <span>Seats: <span className="font-medium">{seatNumbers}</span></span>
                                 </div>
                             </div>
                        </div>

                         {/* Boarding & Dropping Points */}
                         <div className="pb-4 border-b">
                             <h3 className="text-md font-semibold text-gray-700 mb-2">Pickup & Drop</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                 <div className="flex items-start">
                                     <MapPin size={16} className="mr-2 mt-0.5 text-green-500 flex-shrink-0"/>
                                     <span>Boarding: <span className="font-medium">{boardingPointId}</span></span>
                                     {/* TODO: Display actual point name/time based on ID */}
                                 </div>
                                 <div className="flex items-start">
                                      <MapPin size={16} className="mr-2 mt-0.5 text-red-500 flex-shrink-0"/>
                                     <span>Dropping: <span className="font-medium">{deboardingPointId}</span></span>
                                      {/* TODO: Display actual point name/time based on ID */}
                                 </div>
                             </div>
                         </div>

                        {/* Total Fare */}
                        <div className="flex justify-between items-center pt-2">
                             <span className="text-md font-semibold text-gray-700">Total Amount Paid:</span>
                             <span className="text-xl font-bold text-primary flex items-center">
                                 <IndianRupee size={18} className="mr-0.5"/>{totalFare.toFixed(0)}
                             </span>
                        </div>
                         {paymentMethod === 'Cash' && (
                             <p className="text-center text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">Please pay ₹{totalFare.toFixed(0)} in cash upon boarding.</p>
                         )}
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-gray-50 border-t flex justify-center space-x-4">
                        <button onClick={handleDownloadPdf} className="flex items-center px-5 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 transition-colors">
                            <Download size={16} className="mr-2" /> Download Ticket (PDF)
                        </button>
                        {/* Only show Cancel if booking is cancellable */}
                        {status !== 'Cancelled' && status !== 'Completed' && (
                            <button onClick={handleCancelTicket} className="flex items-center px-5 py-2 border border-red-300 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                                <X size={16} className="mr-2" /> Cancel Booking
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookingConfirmationPage;
