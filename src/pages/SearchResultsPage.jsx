// src/pages/SearchResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { format, parseISO, addDays, subDays, isToday, isTomorrow } from 'date-fns';
import { ArrowLeft, ArrowRight, SlidersHorizontal, CalendarDays, Clock, Bus, Users, IndianRupee, Star, Zap, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { findSchedules } from '../services/scheduleService'; // Assuming this exists now

// --- Helper Functions ---
const formatDate = (date, fmt = 'eee, dd MMM') => {
    try {
        return format(date, fmt); // e.g., Mon, 06 May
    } catch (e) {
        console.error("Error formatting date:", e);
        return "Invalid Date";
    }
};
const formatDateISO = (date) => {
     try {
        return format(date, 'yyyy-MM-dd'); // For API calls
    } catch (e) {
        console.error("Error formatting date to ISO:", e);
        return ""; // Return empty string or handle appropriately
    }
};

// --- Dummy Data (Replace with API data) ---
const dummySchedules = [
    { _id: 's1', departureTime: '2025-05-10T06:30:00.000Z', arrivalTime: '2025-05-10T11:00:00.000Z', farePerSeat: 450, seatsAvailable: 5, vehicle: { _id: 'v1', model: 'Tempo Traveller', registrationNumber: 'UP32AB1234' }, route: { _id: 'r1', origin: 'Lucknow', destination: 'Kanpur' }, rating: 4.5 },
    { _id: 's2', departureTime: '2025-05-10T08:00:00.000Z', arrivalTime: '2025-05-10T12:45:00.000Z', farePerSeat: 420, seatsAvailable: 10, vehicle: { _id: 'v2', model: 'Mini Bus', registrationNumber: 'UP32CD5678' }, route: { _id: 'r1', origin: 'Lucknow', destination: 'Kanpur' }, rating: 4.2 },
    { _id: 's3', departureTime: '2025-05-10T14:00:00.000Z', arrivalTime: '2025-05-10T18:30:00.000Z', farePerSeat: 480, seatsAvailable: 2, vehicle: { _id: 'v1', model: 'Tempo Traveller', registrationNumber: 'UP32AB1234' }, route: { _id: 'r1', origin: 'Lucknow', destination: 'Kanpur' }, rating: 4.8 },
];
// --- End Dummy Data ---

// --- Components ---

// Date Scroller Item
const DateItem = ({ date, isSelected, onClick }) => {
    let dayLabel = formatDate(date, 'eee'); // Mon
    let dateLabel = formatDate(date, 'dd MMM'); // 06 May

    if (isToday(date)) dayLabel = 'Today';
    if (isTomorrow(date)) dayLabel = 'Tomorrow';

    return (
        <button
            onClick={() => onClick(date)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg min-w-[80px] transition-colors duration-200 ${isSelected ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
            <span className="text-xs font-medium">{dayLabel}</span>
            <span className="text-sm mt-1">{dateLabel}</span>
        </button>
    );
};

// Schedule Card Item
const ScheduleCard = ({ schedule, onSelect }) => {
    const { departureTime, arrivalTime, farePerSeat, seatsAvailable, vehicle, rating } = schedule;

    try {
        const departure = parseISO(departureTime);
        const arrival = parseISO(arrivalTime);

        // Calculate duration (simple example)
        const durationMs = arrival.getTime() - departure.getTime();
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.round((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const durationStr = `${durationHours}h ${durationMinutes > 0 ? `${durationMinutes}m` : ''}`;

        return (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 mb-4">
                <div className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                    {/* Left Side: Time & Vehicle */}
                    <div className="flex-grow">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-lg font-semibold text-gray-800">{format(departure, 'h:mm a')}</span>
                            <span className="text-xs text-gray-500 mx-2">{durationStr}</span>
                            <span className="text-lg font-semibold text-gray-800">{format(arrival, 'h:mm a')}</span>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                            <Bus size={14} /> {vehicle?.model || 'Vehicle'} ({vehicle?.registrationNumber || 'N/A'})
                        </div>
                         {rating && (
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                               <Star size={14} className="text-yellow-500 fill-current"/> {rating.toFixed(1)}
                            </div>
                         )}
                    </div>
                    {/* Right Side: Seats & Price */}
                    <div className="flex flex-col items-end justify-between sm:min-w-[100px]">
                         <div className="text-sm text-green-600 mb-2 flex items-center gap-1 font-medium"> {/* Changed color */}
                            <Users size={14} /> {seatsAvailable ?? 'N/A'} Seats Left
                        </div>
                        <div className="text-xl font-bold text-primary flex items-center">
                             <IndianRupee size={18} className="mr-0.5"/>{farePerSeat?.toFixed(0) ?? 'N/A'}
                        </div>
                         <button
                            onClick={() => onSelect(schedule)}
                            className="mt-2 px-4 py-1.5 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-dark transition-colors duration-200"
                        >
                            Select
                        </button>
                    </div>
                </div>
                 {/* Optional: Add badges like 'Fastest', 'Cheapest' based on logic */}
                 {/* <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">CHEAPEST</div> */}
            </div>
        );
    } catch (error) {
        console.error("Error rendering schedule card:", error, schedule);
        return <div className="bg-red-100 border border-red-300 p-4 rounded-lg mb-4 text-red-700 text-sm">Error displaying this schedule.</div>; // Fallback UI
    }
};


// Main Page Component
function SearchResultsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useAuth();

    // Extract search params from navigation state or URL query params
    const initialOrigin = location.state?.origin || '';
    const initialDestination = location.state?.destination || '';
    const initialDateStr = location.state?.date || formatDateISO(new Date()); // Default to today if not passed

    const [origin, setOrigin] = useState(initialOrigin);
    const [destination, setDestination] = useState(initialDestination);
    // Ensure selectedDate is always a Date object
    const [selectedDate, setSelectedDate] = useState(() => {
        try {
            // Ensure the date string is valid before parsing
            if (initialDateStr && typeof initialDateStr === 'string' && initialDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                 return parseISO(initialDateStr);
            }
            throw new Error("Invalid initial date string format");
        } catch (e) {
            console.error("Invalid date format received in state:", initialDateStr, e);
            return new Date(); // Fallback to today
        }
    });
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    // const [filters, setFilters] = useState({ ac: false, nonAc: false, ... });

    // Generate dates for the scroller - ensure selectedDate is valid
    const dateRange = useMemo(() => {
        const baseDate = selectedDate instanceof Date && !isNaN(selectedDate) ? selectedDate : new Date();
        return [-2, -1, 0, 1, 2, 3, 4].map(offset => addDays(baseDate, offset));
    }, [selectedDate]);

    // Fetch schedules when origin, destination, or selectedDate changes
    useEffect(() => {
        // Ensure selectedDate is a valid Date object before proceeding
        if (!origin || !destination || !(selectedDate instanceof Date) || isNaN(selectedDate) || !token) {
            setSchedules([]); // Clear results if params invalid
            if (!token) setError("Please log in to view schedules.");
            else if (origin && destination && selectedDate) setError("Invalid date selected."); // Specific error if date is bad
            return; // Stop fetching
        }

        const fetchSchedulesData = async () => {
            setIsLoading(true);
            setError(''); // Clear previous errors
            setSchedules([]); // Clear previous results

            const formattedDate = formatDateISO(selectedDate); // Format date for API
            if (!formattedDate) { // Check if formatting failed
                setError("Invalid date format for search.");
                setIsLoading(false);
                return;
            }

            const searchParams = { origin, destination, date: formattedDate };

            try {
                console.log("Fetching schedules for:", searchParams);
                // *** Replace with actual API call ***
                // const data = await findSchedules(searchParams, token);

                // Simulate API call for now
                await new Promise(resolve => setTimeout(resolve, 1000));
                const data = dummySchedules.filter(s => s.route.origin === origin && s.route.destination === destination); // Basic filter for demo

                console.log("Fetched data:", data);
                setSchedules(data);
                if (data.length === 0) {
                    // Set error only if no data found, don't overwrite other potential errors
                    if (!error) setError('No schedules found for this route and date.');
                }
            } catch (err) {
                console.error("Failed to fetch schedules:", err);
                setError(err.message || 'Could not load schedules.');
                setSchedules([]); // Ensure schedules are empty on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedulesData();
    }, [origin, destination, selectedDate, token]); // Dependencies for refetching

    // Handler for selecting a date from the scroller
    const handleDateSelect = (newDate) => {
        if (newDate instanceof Date && !isNaN(newDate)) {
             setSelectedDate(newDate);
        } else {
            console.error("Invalid date selected from scroller:", newDate);
        }
    };

    // Handler for selecting a schedule card
    const handleScheduleSelect = (schedule) => {
        console.log("Selected Schedule, navigating to seat selection:", schedule);

        // Ensure all necessary data is present before navigating
        if (!schedule || !schedule._id || !origin || !destination || !(selectedDate instanceof Date) || isNaN(selectedDate) || schedule.farePerSeat === undefined) {
            console.error("Missing data needed for seat selection:", { schedule, origin, destination, selectedDate });
            setError("Cannot proceed to seat selection, required data is missing.");
            return;
        }

        const formattedDate = formatDateISO(selectedDate);
        if (!formattedDate) {
             setError("Cannot proceed with invalid date.");
             return;
        }

        // Navigate to the seat selection page, passing required data
        navigate('/seat-selection', { // Ensure this route exists in App.jsx
            state: {
                scheduleId: schedule._id,
                origin: origin, // Pass origin from state
                destination: destination, // Pass destination from state
                date: formattedDate, // Pass selected date string
                departureTime: schedule.departureTime, // Pass specific times
                arrivalTime: schedule.arrivalTime,
                farePerSeat: schedule.farePerSeat, // Pass fare
                vehicle: schedule.vehicle, // Pass vehicle info (model, reg number etc.)
                // Add any other data needed on the seat selection page
            }
        });
    };

    // --- Render Logic ---
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header Section */}
            <div className="bg-primary text-white p-4 shadow-md sticky top-0 z-20">
                 <div className="container mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-1" aria-label="Go back"> <ArrowLeft size={24} /> </button>
                    <div className="text-center flex-1 mx-2 overflow-hidden">
                        <h1 className="text-lg font-semibold truncate">{origin || 'Origin'}</h1>
                        <ArrowUpDown size={16} className="inline-block mx-2 opacity-80" />
                        <h1 className="text-lg font-semibold truncate">{destination || 'Destination'}</h1>
                    </div>
                    {/* Link back to NewBookingPage to modify search */}
                    <Link
                        to="/new-booking"
                        state={{ origin, destination, date: formatDateISO(selectedDate) }}
                        className="p-1"
                        aria-label="Modify search"
                    >
                         <CalendarDays size={24} />
                    </Link>
                </div>
            </div>

            {/* Date Scroller */}
            <div className="bg-white shadow-sm sticky top-[72px] z-10 overflow-x-auto py-2 px-2"> {/* Adjust top value based on header height */}
                 <div className="container mx-auto flex justify-center">
                     <div className="flex space-x-2">
                        {dateRange.map((date, index) => (
                            <DateItem
                                key={index}
                                date={date}
                                isSelected={formatDateISO(date) === formatDateISO(selectedDate)}
                                onClick={handleDateSelect}
                            />
                        ))}
                    </div>
                 </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto p-4 mt-4 pb-20"> {/* Added padding-bottom */}
                {/* Loading State */}
                 {isLoading && (
                    <div className="text-center py-10">
                         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                         <p className="mt-3 text-gray-600">Finding schedules...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="text-center py-10 px-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                )}

                {/* Results - Show only if not loading and no error message exists */}
                {!isLoading && !error && schedules.length > 0 && (
                    <div>
                        {schedules.map(schedule => (
                            <ScheduleCard
                                key={schedule._id}
                                schedule={schedule}
                                onSelect={handleScheduleSelect} // Pass the updated handler
                            />
                        ))}
                    </div>
                )}
                 {/* No Results - Show only if not loading, no error message exists, and schedules array is empty */}
                 {!isLoading && !error && schedules.length === 0 && (
                    <div className="text-center py-10 px-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-500">No schedules available for the selected route and date.</p>
                    </div>
                 )}
            </div>

            {/* Filter Bar (Sticky Bottom) */}
             <div className="sticky bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-3 z-20">
                <div className="container mx-auto flex justify-center items-center">
                    {/* TODO: Implement filter modal */}
                    <button className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-medium rounded-full shadow-md hover:bg-primary-dark transition-colors">
                        <SlidersHorizontal size={18} />
                        Filter
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Export Helper Components (if they are defined within this file) ---
// It's generally better to move DateItem and ScheduleCard to their own files
// in a components directory, but exporting here if kept inline:
// export { DateItem, ScheduleCard };

export default SearchResultsPage;
