// src/pages/NewBookingPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { findSchedules, getSeatLayout } from '../services/scheduleService';
import { getReviewsForSchedule } from '../services/reviewService';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ArrowRightLeft, Search, Bus, Users, Clock, IndianRupee, Armchair, CircleUser, X, Check, User, Star, MessageSquare, XCircle, Edit, TrendingUp } from 'lucide-react'; // Added TrendingUp
import { format, parseISO, formatDistanceStrict, formatDistanceToNow } from 'date-fns';

// --- Components ---
import StarRatingInput from '../components/StarRatingInput';
import ReviewForm from '../components/ReviewForm';

// --- Configuration Data ---
const UTTAR_PRADESH_CITIES = [ /* ... Keep as is ... */
  "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut",
  "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Moradabad",
  "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Jhansi",
  "Muzaffarnagar", "Mathura", "Ayodhya", "Rampur", "Shahjahanpur",
];
const dummyPopularRoutes = [ /* ... Keep as is ... */
  { _id: '1', origin: 'Lucknow', destination: 'Kanpur', imageUrl: 'https://placehold.co/150x100/E10098/FFFFFF?text=LKO-KAN' },
  { _id: '2', origin: 'Agra', destination: 'Lucknow', imageUrl: 'https://placehold.co/150x100/333333/FFFFFF?text=AGR-LKO' },
  { _id: '3', origin: 'Lucknow', destination: 'Varanasi', imageUrl: 'https://placehold.co/150x100/E10098/FFFFFF?text=LKO-VNS' },
  { _id: '4', origin: 'Noida', destination: 'Agra', imageUrl: 'https://placehold.co/150x100/333333/FFFFFF?text=NOI-AGR' },
];

// --- Seat Component (Keep as is) ---
const Seat = ({ seatData, isSelected, onSelect }) => { /* ... Keep as is ... */
  const { id = '', number = '?', status = 'booked', isFemaleOnly = false } = seatData || {};
  let seatStyles = 'border rounded-lg w-14 h-16 flex flex-col items-center justify-center transition-all duration-200 ease-in-out relative shadow-sm hover:shadow-md';
  let icon = <Armchair size={24} />; let label = number; let selectable = false; let titleText = `Seat ${label}`;
  if (status === 'driver') { seatStyles += ' bg-gray-200 border-gray-400 cursor-not-allowed opacity-80'; icon = <CircleUser size={24} className="text-gray-600" />; label = 'Driver'; titleText = 'Driver Seat'; }
  else if (status === 'booked') { seatStyles += ' bg-gray-500 border-gray-600 text-white cursor-not-allowed'; icon = <X size={18} />; titleText += ' (Booked)'; }
  else if (status === 'available') { selectable = true; if (isSelected) { seatStyles += ' bg-accent border-accent-dark text-white ring-2 ring-offset-1 ring-accent shadow-lg transform scale-105'; icon = <Check size={18} />; titleText += ' (Selected)'; } else if (isFemaleOnly) { seatStyles += ' bg-white border-2 border-pink-400 text-pink-600 cursor-pointer hover:bg-pink-50 hover:border-pink-500'; icon = <User size={20} className="text-pink-500" />; titleText += ' (Female Only)'; } else { seatStyles += ' bg-white border-2 border-green-500 text-green-700 cursor-pointer hover:bg-green-50 hover:border-green-600'; icon = <Armchair size={20} />; titleText += ' (Available)'; } }
  else { seatStyles += ' bg-gray-100 border-gray-300 cursor-not-allowed'; titleText += ' (Unavailable)'; }
  const handleClick = () => { if (selectable && onSelect) onSelect(id); };
  return ( <button type="button" onClick={handleClick} disabled={!selectable} className={seatStyles} aria-label={titleText} title={titleText}> {icon} <span className="text-xs font-semibold mt-0.5">{label}</span> {isFemaleOnly && status === 'available' && !isSelected && (<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white shadow-sm" title="Female Only Seat"></span>)} </button> );
};

// --- Popular Route Card Component (Keep as is) ---
function PopularRouteCard({ route, onClick }) { /* ... Keep as is ... */
    return ( <div className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer transform transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.03]" onClick={() => onClick(route.origin, route.destination)} style={{ perspective: '1000px' }} > <img src={route.imageUrl || 'https://placehold.co/150x100/cccccc/FFFFFF?text=Route'} alt={`Route from ${route.origin} to ${route.destination}`} className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-110" onError={(e) => { e.target.src = 'https://placehold.co/150x100/cccccc/FFFFFF?text=Error'; }} /> <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div> <div className="absolute bottom-0 left-0 p-3 w-full"> <p className="text-md font-semibold text-white drop-shadow-lg truncate"> {route.origin} &rarr; {route.destination} </p> </div> </div> );
}

// --- Review List Modal Component (Keep as is) ---
const ReviewListModal = ({ scheduleId, scheduleInfo, isOpen, onClose }) => { /* ... Keep as is ... */
    const [reviews, setReviews] = useState([]); const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState(''); const { token } = useAuth();
    useEffect(() => { if (isOpen && scheduleId) { const fetchReviews = async () => { setIsLoading(true); setError(''); try { const fetchedReviews = await getReviewsForSchedule(scheduleId, token); setReviews(fetchedReviews || []); } catch (err) { setError(err.message || "Could not load reviews."); } finally { setIsLoading(false); } }; fetchReviews(); } else { setReviews([]); setError(''); setIsLoading(false); } }, [isOpen, scheduleId, token]);
    if (!isOpen) return null; const formatRelativeDate = (dateString) => { try { return formatDistanceToNow(parseISO(dateString), { addSuffix: true }); } catch { return "Invalid date"; } };
    return ( <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out" onClick={onClose}> <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in" onClick={(e) => e.stopPropagation()}> <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-gray-50 to-gray-100"> <div className='flex items-center gap-3'> <MessageSquare size={22} className='text-primary' /> <h3 className="text-lg font-semibold text-gray-800"> Reviews: {scheduleInfo?.origin} <ArrowRightLeft size={14} className='inline mx-1 opacity-60'/> {scheduleInfo?.destination} ({scheduleInfo?.time}) </h3> </div> <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="Close reviews modal"> <XCircle size={26} /> </button> </div> <div className="p-6 overflow-y-auto flex-grow"> {isLoading && ( <div className="text-center text-gray-500 py-10 flex flex-col items-center"> <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div> Loading reviews... </div> )} {error && ( <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">{error}</div> )} {!isLoading && !error && reviews.length === 0 && ( <div className="text-center text-gray-500 py-10 px-4 bg-gray-50 rounded-lg border border-dashed"> <MessageSquare size={32} className="mx-auto text-gray-400 mb-3" /> No reviews yet for this schedule. </div> )} {!isLoading && !error && reviews.length > 0 && ( <ul className="space-y-5"> {reviews.map((review) => ( <li key={review._id} className="pb-5 border-b border-gray-200 last:border-b-0"> <div className="flex items-start space-x-3"> <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm"> {review.user?.name ? review.user.name.charAt(0).toUpperCase() : '?'} </div> <div className="flex-grow"> <div className="flex justify-between items-center mb-1"> <span className="text-sm font-semibold text-gray-800"> {review.user?.name || 'Anonymous User'} </span> <span className="text-xs text-gray-400"> {formatRelativeDate(review.createdAt)} </span> </div> <div className="flex items-center mb-2"> {[...Array(5)].map((_, i) => ( <Star key={i} size={16} className={`mr-0.5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill={i < review.rating ? 'currentColor' : 'none'} /> ))} </div> {review.comment && ( <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p> )} </div> </div> </li> ))} </ul> )} </div> <div className="p-4 bg-gray-50 border-t text-right"> <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"> Close </button> </div> </div> <style>{` @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; } `}</style> </div> );
};

// --- Search Summary Bar Component (Keep as is) ---
const SearchSummaryBar = ({ origin, destination, date, onModifySearch }) => { /* ... Keep as is ... */
    const formattedDate = date ? format(parseISO(date + 'T00:00:00.000Z'), 'eee, dd MMM') : 'N/A';
    return ( <div className="p-5 mb-8 bg-gradient-to-r from-blue-50 via-white to-pink-50 rounded-xl shadow-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4"> <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-base text-gray-700"> <div className="flex items-center"> <MapPin size={18} className="text-blue-600 mr-2" /> <span><span className="font-semibold text-gray-800">{origin}</span> <ArrowRightLeft size={14} className='inline mx-1 opacity-60'/> <span className="font-semibold text-gray-800">{destination}</span></span> </div> <div className="flex items-center"> <Calendar size={18} className="text-green-600 mr-2" /> <span className="font-semibold text-gray-800">{formattedDate}</span> </div> </div> <button onClick={onModifySearch} className="flex-shrink-0 flex items-center px-5 py-2.5 bg-white text-primary text-sm font-semibold rounded-lg border border-primary hover:bg-primary hover:text-white transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"> <Edit size={16} className="mr-2" /> Modify Search </button> </div> );
};


// --- Main Component ---
function NewBookingPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // --- State variables ---
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [seatLayout, setSeatLayout] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [error, setError] = useState('');
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [loadingPopularRoutes, setLoadingPopularRoutes] = useState(false);
  const [errorPopularRoutes, setErrorPopularRoutes] = useState('');
  const [showReviewListModal, setShowReviewListModal] = useState(false);
  const [scheduleToShowReviews, setScheduleToShowReviews] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);


  // Fetch Popular Routes (Keep as is)
  useEffect(() => { /* ... */
    const fetchPopularRoutes = async () => { setLoadingPopularRoutes(true); setErrorPopularRoutes(''); try { await new Promise(resolve => setTimeout(resolve, 500)); setPopularRoutes(dummyPopularRoutes); } catch (err) { setErrorPopularRoutes('Could not load popular routes.'); } finally { setLoadingPopularRoutes(false); } }; fetchPopularRoutes();
   }, []);

  // Calculate total fare (Keep as is)
  const totalCalculatedFare = useMemo(() => { /* ... */
      if (!selectedSchedule || selectedSeats.length === 0) return 0; const scheduleFare = selectedSchedule.farePerSeat || 0; return scheduleFare * selectedSeats.length;
  }, [selectedSeats, selectedSchedule]);

  // Handle swapping locations (Keep as is)
  const handleSwapLocations = () => { /* ... */
      setOriginCity(destinationCity); setDestinationCity(originCity); setSearchPerformed(false); setSelectedSchedule(null); setAvailableSchedules([]); setShowSeatSelection(false); setSelectedSeats([]); setError('');
  };

  // Find Available Schedules (Keep as is)
  const handleSearchSchedules = async (e) => { /* ... */
     if (e) e.preventDefault(); setError('');
     if (!originCity || !destinationCity || !travelDate || originCity === destinationCity) { setError('Please select a valid origin, destination, and date.'); setSearchPerformed(false); return; }
     if (!token) { setError('Please log in to find schedules.'); return; }
     setLoadingSchedules(true); setSearchPerformed(true); setSelectedSchedule(null); setAvailableSchedules([]); setShowSeatSelection(false); setSelectedSeats([]);
     console.log(`[Frontend] Finding schedules for ${originCity} to ${destinationCity} on ${travelDate}`);
     try {
       const searchParams = { origin: originCity, destination: destinationCity, date: travelDate };
       console.log("[Frontend] Calling findSchedules service...");
       const schedulesArray = await findSchedules(searchParams, token);
       console.log("[Frontend] Received schedulesArray:", schedulesArray);
       if (Array.isArray(schedulesArray)) {
           setAvailableSchedules(schedulesArray); console.log("[Frontend] Set availableSchedules state.");
           if (schedulesArray.length === 0) { console.log("[Frontend] No schedules found, setting error message."); setError('No schedules found for the selected route and date.'); }
           else { setError(''); console.log("[Frontend] Schedules found, error cleared."); }
       } else { console.warn("[Frontend] Data from findSchedules is not an array:", schedulesArray); setAvailableSchedules([]); setError('Received invalid data format for schedules.'); }
     } catch (err) { console.error("[Frontend] Failed to fetch available schedules:", err); setError(err.message || 'Could not find available schedules.'); setAvailableSchedules([]); }
     finally { console.log("[Frontend] Setting loadingSchedules state to false."); setLoadingSchedules(false); }
    };

  // Handle selecting a schedule -> Show Seat Selection (Keep as is)
  const handleSelectSchedule = async (schedule) => { /* ... */
      if (!schedule || !schedule._id || typeof schedule._id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(schedule._id)) { console.error("Invalid schedule object or ID selected:", schedule); setError("Invalid schedule data received. Cannot load seats."); return; }
      if (!token) { setError("Authentication error. Cannot load seats."); return; }
      setSelectedSchedule(schedule); setShowSeatSelection(true); setSelectedSeats([]); setError(''); setLoadingSeats(true); setSeatLayout([]);
      console.log("Selected Schedule, fetching seats for:", schedule._id);
      try {
          const fetchedSeatLayout = await getSeatLayout(schedule._id, token); console.log("Fetched seat layout:", fetchedSeatLayout); setSeatLayout(fetchedSeatLayout || []);
          if (!fetchedSeatLayout || fetchedSeatLayout.length === 0) { setError("Seat layout is currently unavailable for this schedule."); }
      } catch (err) { console.error("Failed to fetch seat layout:", err); setError(err.message || "Could not load seat layout for this schedule."); }
      finally { setLoadingSeats(false); }
  };

  // Handle seat selection/deselection (Keep as is)
  const handleSeatSelect = (seatId) => { /* ... */
      setSelectedSeats(prevSelected => { if (prevSelected.includes(seatId)) { return prevSelected.filter(id => id !== seatId); } else { setError(''); return [...prevSelected, seatId]; } });
  };

   // Handle Proceeding to Passenger Details (Keep as is)
    const handleProceedToDetails = () => { /* ... */
        setError('');
        if (!selectedSchedule || selectedSeats.length === 0) { setError("Please select a schedule and at least one seat."); return; }
        if (!selectedSchedule._id || typeof selectedSchedule._id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(selectedSchedule._id)) { setError("Invalid schedule selected. Cannot proceed."); console.error("Invalid schedule ID:", selectedSchedule._id); return; }
        if (!selectedSchedule.departureDateTime || !selectedSchedule.arrivalDateTime) { setError("Schedule time information is missing. Cannot proceed."); console.error("Missing departureDateTime or arrivalDateTime in selectedSchedule:", selectedSchedule); return; }
        navigate('/passenger-details', { state: { scheduleId: selectedSchedule._id, origin: originCity, destination: destinationCity, date: travelDate, departureTime: selectedSchedule.departureDateTime, arrivalTime: selectedSchedule.arrivalDateTime, farePerSeat: selectedSchedule.farePerSeat, vehicle: selectedSchedule.vehicle, selectedSeatIds: selectedSeats.map(id => getSeatById(id)?.number).filter(Boolean), totalFare: totalCalculatedFare } });
    };

  // Helper to get seat data by ID (Keep as is)
  const getSeatById = (id) => seatLayout.find(seat => seat.id === id);

  // Handle clicking popular route (Keep as is)
  const handlePopularRouteClick = (origin, destination) => { /* ... */
      setOriginCity(origin); setDestinationCity(destination); setTravelDate(today); setSearchPerformed(false); setSelectedSchedule(null); setAvailableSchedules([]); setShowSeatSelection(false); setSelectedSeats([]); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const today = new Date().toISOString().split('T')[0];

  // Helper function to format schedule times safely (Keep as is)
  const formatScheduleTime = (dateTimeString) => { /* ... */
    if (dateTimeString && typeof dateTimeString === 'string') { try { return format(parseISO(dateTimeString), 'h:mm a'); } catch (error) { console.error("Error parsing date for formatting:", dateTimeString, error); return "Invalid Time"; } } return "N/A";
  };

  // Handler to open review list modal (Keep as is)
  const handleShowReviews = (schedule) => { /* ... */
    console.log("Showing reviews for schedule:", schedule); setScheduleToShowReviews(schedule); setShowReviewListModal(true);
  };
  const handleCloseReviewListModal = () => { /* ... */
    setShowReviewListModal(false); setScheduleToShowReviews(null);
  };

  // Handler to modify search (Keep as is)
  const handleModifySearch = () => { /* ... */
    setSearchPerformed(false); setSelectedSchedule(null); setShowSeatSelection(false); setSelectedSeats([]);
  };

  // Define Animation Variants (Keep as is)
  const containerVariants = { /* ... */ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.1, when: "beforeChildren", staggerChildren: 0.08 } } };
  const itemVariants = { /* ... */ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };
  const formContainerVariants = { /* ... */ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1, ease: "easeOut" } } };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-10"> Book Your <span className="text-accent font-extrabold">Safar</span>! </h1>

        {error && !searchPerformed && ( <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded relative mb-8 shadow" role="alert"><span>{error}</span></div> )}

        {/* --- Conditional Rendering: Form OR Summary Bar + Results --- */}
        <AnimatePresence mode="wait">
            {!searchPerformed ? (
                // Show Full Search Form with Entrance Animation
                <motion.div key="search-form" variants={formContainerVariants} initial="hidden" animate="visible" exit="hidden">
                    {/* Search Form Content */}
                    <div className="p-1 rounded-2xl bg-gradient-to-br from-accent via-pink-400 to-primary mb-6 shadow-xl"> {/* Reduced bottom margin */}
                        <div className="bg-white rounded-[14px] p-6 md:p-8">
                            <form onSubmit={handleSearchSchedules} className="space-y-6">
                                {/* ... form fields ... */}
                                <div className="relative border border-gray-200 rounded-lg p-4 pt-5 bg-gray-50/30"> <div className="relative mb-4"> <label htmlFor="originCity" className="block text-xs font-medium text-gray-500 mb-1 ml-1">From</label> <div className="flex items-center"> <Bus size={20} className="text-gray-400 mr-3 flex-shrink-0" /> <select id="originCity" name="originCity" value={originCity} onChange={(e) => { setOriginCity(e.target.value); setError(''); }} required className="w-full p-0 border-none focus:ring-0 text-base text-gray-800 font-medium appearance-none bg-transparent"> <option value="" disabled>Select Origin City</option> {UTTAR_PRADESH_CITIES.sort().map(city => <option key={city} value={city}>{city}</option>)} </select> </div> </div> <hr className="border-gray-200 my-2" /> <div className="relative mt-4"> <label htmlFor="destinationCity" className="block text-xs font-medium text-gray-500 mb-1 ml-1">To</label> <div className="flex items-center"> <MapPin size={20} className="text-gray-400 mr-3 flex-shrink-0" /> <select id="destinationCity" name="destinationCity" value={destinationCity} onChange={(e) => { setDestinationCity(e.target.value); setError(''); }} required className="w-full p-0 border-none focus:ring-0 text-base text-gray-800 font-medium appearance-none bg-transparent"> <option value="" disabled>Select Destination City</option> {UTTAR_PRADESH_CITIES.sort().filter(city => city !== originCity).map(city => <option key={city} value={city}>{city}</option>)} </select> </div> </div> <button type="button" onClick={handleSwapLocations} className="absolute top-1/2 right-4 transform -translate-y-1/2 -mt-3 bg-white hover:bg-gray-100 p-2 rounded-full border border-gray-300 transition-all duration-200 z-10 shadow hover:shadow-md" aria-label="Swap origin and destination" title="Swap locations"><ArrowRightLeft size={18} className="text-primary"/></button> </div>
                                <div className="relative border border-gray-200 rounded-lg p-4 pt-5 bg-gray-50/30"> <label htmlFor="travelDate" className="block text-xs font-medium text-gray-500 mb-1 ml-1">Date</label> <div className="flex items-center"> <Calendar size={20} className="text-gray-400 mr-3 flex-shrink-0" /> <input type="date" id="travelDate" value={travelDate} onChange={(e) => { setTravelDate(e.target.value); setError(''); }} required min={today} className="w-full p-0 border-none focus:ring-0 text-base text-gray-800 font-medium appearance-none bg-transparent"/> </div> </div>
                                <motion.button type="submit" disabled={loadingSchedules || !originCity || !destinationCity || !travelDate} className="w-full flex items-center justify-center px-6 py-3.5 border border-transparent text-lg font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-accent to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-60 disabled:cursor-not-allowed" whileHover={{ scale: 1.03, boxShadow: "0px 8px 20px rgba(236, 72, 153, 0.4)" }} transition={{ type: "spring", stiffness: 300, damping: 15 }} > {loadingSchedules ? <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Searching...</> : <><Search size={22} className="mr-2.5" /> Search Schedules</>} </motion.button>
                            </form>
                        </div>
                    </div>

                    {/* Popular Routes Section */}
                    {/* *** ADDED MOTION WRAPPER FOR POPULAR ROUTES *** */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }} // Delay after form animates in
                        className="mt-10 mb-10" // Adjusted margins
                    >
                        <div className="flex items-center mb-6">
                             <TrendingUp className="text-primary mr-3" size={24} />
                             <h2 className="text-2xl font-semibold text-gray-800">Popular Routes</h2>
                        </div>
                        {loadingPopularRoutes && <div className="text-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div></div>}
                        {errorPopularRoutes && <p className="text-center text-red-500 bg-red-50 p-3 rounded-md">{errorPopularRoutes}</p>}
                        {!loadingPopularRoutes && !errorPopularRoutes && (
                            popularRoutes.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 md:gap-6">
                                {popularRoutes.map(route => ( <PopularRouteCard key={route._id} route={route} onClick={handlePopularRouteClick} /> ))}
                            </div>
                            ) : ( <p className="text-center text-gray-500">No popular routes found.</p> )
                        )}
                    </motion.div>
                </motion.div>
            ) : (
                 // Show Summary Bar + Results with Entrance Animation
                 <motion.div key="search-results" variants={formContainerVariants} initial="hidden" animate="visible" exit="hidden" >
                    <SearchSummaryBar origin={originCity} destination={destinationCity} date={travelDate} onModifySearch={handleModifySearch} />
                    {/* ... Results and Seat Selection ... */}
                    <div className="flex flex-col lg:flex-row gap-8"> <div className={`lg:w-1/2 transition-opacity duration-300 ${selectedSchedule ? 'opacity-50 lg:opacity-100' : 'opacity-100'}`}> <h2 className="text-xl font-semibold text-gray-700 mb-5">Available Schedules</h2> {loadingSchedules ? ( <div className="text-center py-10"> <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div> <p className="mt-3 text-gray-600">Searching...</p> </div> ) : error ? ( <div className="text-center py-10 px-4 bg-red-50 border border-red-200 rounded-lg"> <p className="text-red-600 font-medium">{error}</p> </div> ) : availableSchedules.length > 0 ? ( <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="visible" > {availableSchedules.map(schedule => ( <motion.div key={schedule._id} variants={itemVariants}> <div className={`rounded-xl border transition-all duration-200 ease-in-out flex flex-col overflow-hidden shadow-md hover:shadow-lg ${selectedSchedule?._id === schedule._id ? 'border-primary ring-2 ring-primary ring-offset-1 bg-primary-lightest' : 'bg-white border-gray-200'}`}> <div className='p-5 flex-grow cursor-pointer hover:bg-gray-50/50' onClick={() => handleSelectSchedule(schedule)}> <div className="flex justify-between items-center mb-3"> <div className="flex items-center gap-2 font-semibold text-lg text-gray-800"> <Clock size={18} className="text-primary"/> <span>{formatScheduleTime(schedule.departureDateTime)}</span> <span className='text-gray-400 font-normal mx-1'>&rarr;</span> <span>{formatScheduleTime(schedule.arrivalDateTime)}</span> </div> </div> <div className="text-sm text-gray-600 mb-3 flex items-center gap-2 border-t pt-3"> <Bus size={16} className="opacity-70"/> <span>{schedule.vehicle?.model} ({schedule.vehicle?.registrationNumber}) - {schedule.vehicle?.type}</span> </div> <div className="flex justify-between items-center border-t pt-3"> <div className="text-sm text-green-600 flex items-center gap-2 font-medium"> <Users size={16} className="opacity-80"/> <span>{schedule.availableSeats} seats available</span> </div> <div className="text-right text-xl font-bold text-primary flex items-center gap-1"> <IndianRupee size={18}/> <span>{(schedule.farePerSeat || 0).toFixed(0)}</span> <span className='text-xs font-normal text-gray-500'>/ seat</span> </div> </div> </div> {(schedule.numReviews > 0) ? ( <div className="bg-gray-50 px-5 py-2 border-t"> <button onClick={() => handleShowReviews(schedule)} className="flex items-center text-xs text-yellow-700 hover:text-yellow-800 transition-colors w-full justify-center sm:justify-start" title={`View ${schedule.numReviews} review(s)`}> <Star size={15} className="mr-1.5 text-yellow-500" fill="currentColor" /> <span className="font-semibold text-sm">{schedule.averageRating?.toFixed(1)}</span> <span className="ml-1.5 text-gray-500">({schedule.numReviews} Reviews)</span> </button> </div> ) : ( <div className="bg-gray-50 px-5 py-2 border-t"> <span className="text-xs text-gray-400 italic">No reviews yet</span> </div> )} </div> </motion.div> ))} </motion.div> ) : ( <div className="text-center py-10 px-4 bg-gray-50 border border-gray-200 rounded-lg"> <p className="text-gray-500">No schedules found for the selected route and date.</p> </div> )} </div> {selectedSchedule && ( <div className="lg:w-1/2 sticky top-[calc(69px+80px)] self-start"> {/* ... Seat selection UI ... */} <h2 className="text-xl font-semibold text-gray-700 mb-5">Select Your Seats</h2> {/* Legend */} <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs mb-6 bg-white p-3 rounded-lg shadow-sm border"> <div className="flex items-center"><span className="w-4 h-4 rounded border-2 border-green-500 mr-1.5"></span>Available</div> <div className="flex items-center"><span className="w-4 h-4 rounded bg-gray-500 border border-gray-600 mr-1.5"></span>Booked</div> <div className="flex items-center"><span className="w-4 h-4 rounded border-2 border-pink-400 mr-1.5"></span>Female</div> <div className="flex items-center"><span className="w-4 h-4 rounded bg-accent border-accent-dark mr-1.5"></span>Selected</div> <div className="flex items-center"><span className="w-4 h-4 rounded bg-gray-200 border border-gray-400 mr-1.5 flex items-center justify-center"><CircleUser size={10}/></span>Driver</div> </div> {loadingSeats && <p className="text-center text-gray-600 py-4">Loading seat layout...</p>} {error && !loadingSeats && <p className="text-center text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>} {/* Seat Layout Render */} {!loadingSeats && seatLayout.length > 0 && ( <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col items-center"> <p className="text-sm text-gray-500 mb-4">Tap on available seats to select</p> <div className="border-2 border-gray-300 rounded-lg p-4 w-full max-w-[300px] bg-gray-50/50"> <div className="flex justify-end mb-4 pr-2"> <div className="w-8 h-8 border-2 border-gray-500 rounded-full flex items-center justify-center" title="Driver Position"> <CircleUser size={18} className="text-gray-500" /> </div> </div> <div className="space-y-5"> <div className="flex justify-between items-center px-4"> <Seat seatData={getSeatById('P1') || {id:'P1', number:'P1', status:'booked'}} isSelected={selectedSeats.includes('P1')} onSelect={handleSeatSelect} /> <Seat seatData={getSeatById('D') || {id:'D', number:'D', status:'driver'}} isSelected={false} onSelect={null} /> </div> <div className="flex justify-between items-center"> <Seat seatData={getSeatById('P2') || {id:'P2', number:'P2', status:'booked'}} isSelected={selectedSeats.includes('P2')} onSelect={handleSeatSelect} /> <Seat seatData={getSeatById('P3') || {id:'P3', number:'P3', status:'booked'}} isSelected={selectedSeats.includes('P3')} onSelect={handleSeatSelect} /> <Seat seatData={getSeatById('P4') || {id:'P4', number:'P4', status:'booked'}} isSelected={selectedSeats.includes('P4')} onSelect={handleSeatSelect} /> </div> <div className="flex justify-around items-center pt-2"> <Seat seatData={getSeatById('P5') || {id:'P5', number:'P5', status:'booked'}} isSelected={selectedSeats.includes('P5')} onSelect={handleSeatSelect} /> <Seat seatData={getSeatById('P6') || {id:'P6', number:'P6', status:'booked'}} isSelected={selectedSeats.includes('P6')} onSelect={handleSeatSelect} /> </div> </div> </div> </div> )} {/* Proceed Button */} {selectedSeats.length > 0 && !loadingSeats && ( <div className="mt-8 border-t border-gray-200 pt-6 bg-white p-5 rounded-b-lg shadow-lg"> <div className="flex justify-between items-center mb-5"> <span className="text-lg font-medium text-gray-700">Total Fare ({selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''}):</span> <span className="text-2xl font-bold text-accent flex items-center"> <IndianRupee size={20} className="mr-0.5"/>{totalCalculatedFare.toFixed(2)} </span> </div> <div className="text-center"> <button type="button" onClick={handleProceedToDetails} disabled={selectedSeats.length === 0} className={`w-full md:w-auto inline-flex items-center justify-center px-10 py-3 border border-transparent text-lg font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-accent to-pink-600 hover:from-accent-dark hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.03]`}> Proceed to Enter Details </button> </div> </div> )} </div> )} </div>
                 </motion.div>
            )}
        </AnimatePresence>

        {/* Review List Modal (Keep as is) */}
        <ReviewListModal
            isOpen={showReviewListModal}
            onClose={handleCloseReviewListModal}
            scheduleId={scheduleToShowReviews?._id}
            scheduleInfo={{
                origin: scheduleToShowReviews?.routeOrigin,
                destination: scheduleToShowReviews?.routeDestination,
                time: formatScheduleTime(scheduleToShowReviews?.departureDateTime)
            }}
        />

      </div>
    </div>
  );
}

export default NewBookingPage;
  