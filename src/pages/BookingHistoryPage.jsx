// src/pages/BookingHistoryPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format, parseISO, isToday, isTomorrow, formatDistanceToNowStrict } from 'date-fns';
import { getMyBookings } from '../services/bookingService';
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from '../components/ReviewForm';
import StarRatingInput from '../components/StarRatingInput'; // Corrected import
import { ArrowLeft, Calendar, Users, IndianRupee, Bus, Edit3, CheckCircle } from 'lucide-react'; // Added CheckCircle

// --- Helper Functions (Keep as they are) ---
const formatDateForCard = (dateString) => {
    try {
        const date = parseISO(dateString);
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return format(date, 'dd MMM yy');
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return "Invalid Date";
    }
};

const getCityAbbreviation = (cityName = '') => {
    if (!cityName) return 'N/A';
    return cityName.substring(0, 3).toUpperCase();
};

// --- Booking Card Component (Using booking.isReviewed) ---
const BookingCard = ({ booking, onWriteReviewClick }) => {
    console.log("[BookingCard] Received booking prop:", booking);
    console.log("[BookingCard] Checking booking.isReviewed:", booking?.isReviewed);

    // Destructure with fallbacks - *** CORRECTED ACCESS PATH ***
    const origin = booking.schedule?.routeOrigin || booking.origin || 'Origin N/A';
    const destination = booking.schedule?.routeDestination || booking.destination || 'Destination N/A';
    // ********************************************************
    const departureTimeStr = booking.schedule?.departureDateTime || booking.departureTime;
    const arrivalTimeStr = booking.schedule?.arrivalDateTime || booking.arrivalTime;
    const travelDateStr = departureTimeStr;
    const seatsCount = Array.isArray(booking.seats) ? booking.seats.length : (booking.numberOfSeats || 0);
    const fare = booking.totalFare || booking.fare || 0;
    const status = booking.status || 'Unknown';
    const isReviewed = booking.isReviewed === true;

    let durationStr = '';
    try {
        if (departureTimeStr && arrivalTimeStr) {
            const departure = parseISO(departureTimeStr);
            const arrival = parseISO(arrivalTimeStr);
            if (!isNaN(departure.getTime()) && !isNaN(arrival.getTime())) {
                const durationMs = arrival.getTime() - departure.getTime();
                const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                const durationMinutes = Math.round((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                durationStr = `${durationHours}h ${durationMinutes > 0 ? `${durationMinutes}m` : ''}`;
            } else { durationStr = "N/A"; }
        }
    } catch (e) { console.error("Error calculating duration for booking:", booking._id, e); durationStr = "N/A"; }

    let cardStyle = "bg-white";
    let textStyle = "text-gray-700";
    if (status === 'Cancelled') { cardStyle = "bg-red-50 opacity-80"; textStyle = "text-red-600"; }
    else if (status === 'Completed') { cardStyle = "bg-green-50 opacity-90"; textStyle = "text-green-700"; }

    return (
        <div className={`rounded-xl shadow-md overflow-hidden border border-gray-200 mb-4 ${cardStyle} transition-all duration-200 ease-in-out hover:shadow-lg`}>
            <div className="p-4">
                {/* Top Row: Origin -> Destination */}
                 <div className="flex justify-between items-center mb-3">
                    <div className="text-left">
                        {/* Use the corrected origin variable */}
                        <p className={`text-xs font-medium ${textStyle} opacity-80`}>{origin}</p>
                        <p className={`text-xl font-bold ${textStyle}`}>{getCityAbbreviation(origin)}</p>
                    </div>
                    <div className="text-center px-2 flex-shrink-0">
                        <Bus size={18} className="text-gray-400 inline-block"/>
                        {durationStr && <p className="text-xs text-gray-500 mt-1">{durationStr}</p>}
                        <div className="border-b border-dashed border-gray-300 my-1"></div>
                    </div>
                    <div className="text-right">
                         {/* Use the corrected destination variable */}
                        <p className={`text-xs font-medium ${textStyle} opacity-80`}>{destination}</p>
                        <p className={`text-xl font-bold ${textStyle}`}>{getCityAbbreviation(destination)}</p>
                    </div>
                </div>
                {/* Bottom Row: Date, Persons, Fare */}
                 <div className={`flex justify-between items-center border-t border-gray-200 pt-3 mt-3 ${textStyle}`}>
                    <div className="flex items-center text-sm">
                        <Calendar size={14} className="mr-1.5 opacity-70" />
                        <span>{travelDateStr ? formatDateForCard(travelDateStr) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <Users size={14} className="mr-1.5 opacity-70" />
                        <span>{seatsCount} Seat{seatsCount === 1 ? '' : 's'}</span>
                    </div>
                    <div className="flex items-center text-sm font-semibold">
                        <IndianRupee size={14} className="mr-0.5 opacity-70"/>
                        <span>{fare?.toFixed(0) ?? 'N/A'}</span>
                    </div>
                </div>
            </div>
            {/* Review Button Section - Updated Logic */}
            {status === 'Completed' && (
                <div className="bg-gray-50 px-4 py-3 border-t text-right">
                    {/* Check booking.isReviewed directly */}
                    {isReviewed ? ( // Use the derived isReviewed boolean
                        <span className="text-sm font-medium text-green-600 flex items-center justify-end">
                            <CheckCircle size={16} className="mr-1.5" />
                            Reviewed
                        </span>
                    ) : (
                        <button
                            onClick={() => onWriteReviewClick(booking)}
                            className="text-sm font-medium text-accent hover:text-accent-dark flex items-center justify-end ml-auto px-3 py-1.5 rounded-md hover:bg-accent-lightest transition-colors"
                        >
                            <Edit3 size={14} className="mr-1.5" />
                            Write a Review
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};


// Main Page Component
function BookingHistoryPage() {
    const navigate = useNavigate();
    const [allBookings, setAllBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('Completed'); // Default to Completed
    const { token } = useAuth();

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [bookingToReview, setBookingToReview] = useState(null);

    useEffect(() => {
        console.log("[BookingHistoryPage] useEffect triggered. Token:", token ? "Exists" : "Missing");
        let isMounted = true;
        const fetchBookings = async () => {
            if (!token) {
                console.log("[BookingHistoryPage] No token found, setting error and stopping load.");
                if (isMounted) { setError('You must be logged in to view bookings.'); setIsLoading(false); }
                return;
            }
            console.log("[BookingHistoryPage] Setting isLoading to true.");
            if (isMounted) setIsLoading(true);
            if (isMounted) setError(null);

            try {
                console.log("[BookingHistoryPage] Calling getMyBookings service...");
                const bookingsData = await getMyBookings(token);
                console.log("[BookingHistoryPage] Data received from getMyBookings:", bookingsData);

                if (!isMounted) return;

                if (Array.isArray(bookingsData)) {
                     const sortedData = [...bookingsData].sort((a, b) => {
                        let timeA = 0, timeB = 0;
                        try { timeA = parseISO(a.schedule?.departureDateTime || a.departureTime || 0).getTime(); } catch (e) {}
                        try { timeB = parseISO(b.schedule?.departureDateTime || b.departureTime || 0).getTime(); } catch (e) {}
                        if (isNaN(timeA)) timeA = 0; if (isNaN(timeB)) timeB = 0;
                        return timeB - timeA;
                    });
                    console.log("[BookingHistoryPage] Sorted bookings:", sortedData);
                    setAllBookings(sortedData);
                } else {
                    console.warn("[BookingHistoryPage] Data from getMyBookings is not an array:", bookingsData);
                    setAllBookings([]);
                    setError('Received invalid data format for bookings.');
                }
            } catch (err) {
                console.error("[BookingHistoryPage] Failed to fetch bookings in try-catch:", err);
                 if (isMounted) {
                    setError(err.message || 'Failed to load booking history.');
                    setAllBookings([]);
                 }
            } finally {
                console.log("[BookingHistoryPage] Setting isLoading to false in finally block.");
                 if (isMounted) setIsLoading(false);
            }
        };
        fetchBookings();
        return () => { isMounted = false; console.log("[BookingHistoryPage] Component unmounted."); };
    }, [token]);

    useEffect(() => {
        console.log("[BookingHistoryPage] Filtering bookings. ViewMode:", viewMode, "AllBookings count:", allBookings.length);
        let filtered = [];
        if (viewMode === 'Active') {
            const activeStatuses = ['Confirmed', 'Ongoing', 'Pending', 'Scheduled'];
            filtered = allBookings.filter(b => activeStatuses.includes(b.status));
        } else if (viewMode === 'Completed') {
            filtered = allBookings.filter(b => b.status === 'Completed');
        } else { // 'Cancelled'
            filtered = allBookings.filter(b => b.status === 'Cancelled');
        }
        setFilteredBookings(filtered);
        console.log("[BookingHistoryPage] Filtered bookings count:", filtered.length);
    }, [allBookings, viewMode]);

    const handleOpenReviewModal = (booking) => {
        console.log("[BookingHistoryPage] Opening review modal for booking:", booking);
        if (!booking.schedule?._id || (!booking.schedule?.driver?._id && !booking.schedule?.driver) ) {
            console.error("Booking is missing critical schedule or driver information for review:", booking);
            setError("Cannot review this booking: essential schedule or driver details are missing from the booking data.");
            return;
        }
        setBookingToReview(booking);
        setShowReviewModal(true);
    };

    const handleCloseReviewModal = () => {
        console.log("[BookingHistoryPage] Closing review modal.");
        setShowReviewModal(false);
        setBookingToReview(null);
    };

    const handleReviewSubmitted = (submittedBookingId) => {
        console.log(`[BookingHistoryPage] Review submitted for booking ID: ${submittedBookingId}. Updating UI.`);
        setShowReviewModal(false);
        setBookingToReview(null);
        // Update the state directly to reflect the change immediately
        setAllBookings(prevBookings => prevBookings.map(b =>
            b._id === submittedBookingId ? { ...b, isReviewed: true } : b
        ));
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-200">
                <div className="container mx-auto p-4 flex items-center">
                    <button onClick={() => navigate(-1)} className="p-1 mr-3 text-gray-600 hover:text-primary" aria-label="Go back">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-800">Bookings</h1>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white sticky top-[69px] z-10 shadow-sm pt-3 pb-2 px-4 mb-6">
                <div className="container mx-auto flex justify-center space-x-3 sm:space-x-4">
                    {['Active', 'Completed', 'Cancelled'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 ease-in-out border-2 ${
                                viewMode === mode
                                ? 'bg-primary border-primary text-white shadow-md'
                                : 'bg-white border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto p-4">
                {/* Display general page error */}
                 {error && !isLoading && !showReviewModal && (
                    <div className="mb-4 text-center py-4 px-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 font-medium">Error:</p>
                        <p className="text-red-500 text-sm mt-1 break-words">{error}</p>
                         <button onClick={() => setError(null)} className='text-xs text-red-600 underline mt-2'>Dismiss</button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your bookings...</p>
                    </div>
                )}

                {/* Bookings List */}
                {!isLoading && !error && (
                    <div>
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map(booking => (
                                <BookingCard
                                    key={booking._id}
                                    booking={booking} // Pass the whole booking object
                                    onWriteReviewClick={handleOpenReviewModal}
                                />
                            ))
                        ) : (
                            <div className="text-center py-16 px-4 bg-gray-50 border border-gray-200 rounded-lg mt-6">
                                <p className="text-gray-500 font-medium">
                                    You have no {viewMode.toLowerCase()} bookings.
                                </p>
                                <Link to="/new-booking" className="mt-4 inline-block px-5 py-2 bg-accent text-white text-sm font-semibold rounded-lg shadow hover:bg-accent-dark transition-colors">
                                    Book a New Journey
                                </Link>
                            </div>
                        )}
                    </div>
                )}
                 {!isLoading && error && showReviewModal && ( // Show loading error only if not related to modal opening
                     <div className="text-center py-10 px-4 bg-red-50 border border-red-200 rounded-lg">
                         <p className="text-red-600 font-medium">Could not load bookings:</p>
                         <p className="text-red-500 text-sm mt-1 break-words">{error}</p>
                     </div>
                 )}
            </div>

            {/* Review Form Modal */}
            {showReviewModal && bookingToReview && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={handleCloseReviewModal}
                >
                    <div
                        className="bg-transparent max-w-lg w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ReviewForm
                            bookingId={bookingToReview._id}
                            scheduleId={bookingToReview.schedule?._id}
                            driverId={bookingToReview.schedule?.driver?._id || bookingToReview.schedule?.driver}
                            onReviewSubmitted={handleReviewSubmitted}
                            onCancel={handleCloseReviewModal}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingHistoryPage;
