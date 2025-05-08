// src/pages/PassengerDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
// *** Import ArrowRightLeft ***
import { ArrowLeft, MapPin, User, Mail, Phone, Users, Calendar, Clock, IndianRupee, Bus, Trash2, PlusCircle, ArrowRightLeft } from 'lucide-react';

// --- Dummy Data (Replace with API calls later) ---
const dummyBoardingPoints = [
    { id: 'AGR1', name: 'ISBT Agra', time: '10:00 AM', address: 'Near Transport Nagar Gate 1' },
    { id: 'AGR2', name: 'Yamuna Expressway Toll', time: '10:30 AM', address: 'KM 10, Near Milestone 10' },
    { id: 'AGR3', name: 'Kuberpur Cut', time: '10:45 AM', address: 'Main Highway Junction' },
];
const dummyDroppingPoints = [
    { id: 'LKO1', name: 'Alambagh Bus Station', time: '04:00 PM', address: 'Platform 5' },
    { id: 'LKO2', name: 'Polytechnic Chauraha', time: '04:30 PM', address: 'Near Metro Station Gate 2' },
    { id: 'LKO3', name: 'Kaiserbagh Bus Stand', time: '04:45 PM', address: 'Main Terminal' },
];
const dummySavedPassengers = [
    { id: 'p1', name: 'Ashish Shukla', age: 21, gender: 'Male' },
    { id: 'p2', name: 'BN Shukla', age: 63, gender: 'Male' },
    { id: 'p3', name: 'Karishma Pandey', age: 31, gender: 'Female' },
];
// ----------------------------------------------------

// --- Helper Components ---
const InfoCard = ({ children, title, icon: Icon }) => (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Icon size={20} className="mr-2 text-primary opacity-80" /> {title}
        </h2>
        {children}
    </div>
);

const PassengerForm = ({ index, passenger, onChange, onRemove, totalSeats }) => {
    const handleInputChange = (e) => {
        onChange(index, { ...passenger, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-4 border border-gray-200 rounded-lg mb-3 bg-gray-50/50 relative">
             <p className="text-sm font-medium text-gray-600 mb-3">Passenger {index + 1}</p>
             {/* Remove button only if more than 1 seat and not the last required form */}
             {totalSeats > 1 && index >= 1 && (
                 <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                    title="Remove Passenger"
                 >
                    <Trash2 size={16} />
                 </button>
             )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label htmlFor={`name-${index}`} className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                    <input type="text" id={`name-${index}`} name="name" value={passenger.name || ''} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Full Name" />
                </div>
                <div>
                    <label htmlFor={`age-${index}`} className="block text-xs font-medium text-gray-500 mb-1">Age</label>
                    <input type="number" id={`age-${index}`} name="age" value={passenger.age || ''} onChange={handleInputChange} required min="1" max="120" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Age" />
                </div>
                <div>
                    <label htmlFor={`gender-${index}`} className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
                    <select id={`gender-${index}`} name="gender" value={passenger.gender || ''} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white">
                        <option value="" disabled>Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
        </div>
    );
};


function PassengerDetailsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, token } = useAuth(); // Get logged-in user info

    // State from previous page (NewBookingPage)
    const {
        scheduleId, origin, destination, date, departureTime, arrivalTime,
        farePerSeat, vehicle, selectedSeatIds = [], totalFare = 0
    } = location.state || {};

    const numberOfSeats = selectedSeatIds.length;

    // Local state for this page
    const [boardingPoint, setBoardingPoint] = useState('');
    const [droppingPoint, setDroppingPoint] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    // Initialize passenger array based on numberOfSeats
    const [passengers, setPassengers] = useState(() => Array(numberOfSeats > 0 ? numberOfSeats : 1).fill({ name: '', age: '', gender: '' })); // Ensure at least 1 passenger form if seats=0 somehow
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSavedPassengers, setShowSavedPassengers] = useState(false);


    // Pre-fill contact details from logged-in user
    useEffect(() => {
        if (user) {
            setContactEmail(user.email || '');
            setContactPhone(user.phone || '');
        }
        // Redirect if essential state is missing
        if (!scheduleId || numberOfSeats === 0) {
            console.error("Missing state on PassengerDetailsPage, redirecting.");
            navigate('/new-booking', { replace: true });
        }
         // Initialize passenger array when numberOfSeats changes or is initially set
         // Ensure it always creates at least one form if numberOfSeats is valid
         if (numberOfSeats > 0 && passengers.length !== numberOfSeats) {
            setPassengers(Array(numberOfSeats).fill({ name: '', age: '', gender: '' }));
         }

    }, [user, scheduleId, numberOfSeats, navigate]); // Removed passengers from dependency array


    const handlePassengerChange = (index, updatedPassenger) => {
        setPassengers(prev => prev.map((p, i) => (i === index ? updatedPassenger : p)));
    };

     const handleAddPassengerForm = () => {
         if (passengers.length < numberOfSeats) {
             setPassengers(prev => [...prev, { name: '', age: '', gender: '' }]);
         } else {
             console.warn("Attempted to add more passengers than seats selected.");
         }
     };

     const handleRemovePassengerForm = (indexToRemove) => {
         // Allow removing if more passengers than seats (e.g., after error/change)
         // Or if more than 1 seat selected
         if (passengers.length > numberOfSeats || numberOfSeats > 1) {
             setPassengers(prev => prev.filter((_, index) => index !== indexToRemove));
         }
     };

    // --- TODO: Implement selecting saved passengers ---
    const handleSelectSavedPassenger = (savedPassenger) => {
        const firstEmptyIndex = passengers.findIndex(p => !p.name && !p.age && !p.gender);
        if (firstEmptyIndex !== -1) {
            handlePassengerChange(firstEmptyIndex, { ...savedPassenger });
        } else if (passengers.length < numberOfSeats) {
             setPassengers(prev => [...prev, { ...savedPassenger }]);
        } else {
            setError("All passenger slots filled. Remove one to add a saved passenger.");
             setTimeout(() => setError(''), 3000);
        }
        setShowSavedPassengers(false);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // --- Validation ---
        if (!boardingPoint) { setError('Please select a boarding point.'); setIsLoading(false); return; }
        if (!droppingPoint) { setError('Please select a dropping point.'); setIsLoading(false); return; }
        if (!contactEmail || !contactPhone) { setError('Please provide contact email and phone.'); setIsLoading(false); return; }
        // Ensure the number of passenger forms matches the number of seats
        if (passengers.length !== numberOfSeats) {
            setError(`Please provide details for exactly ${numberOfSeats} passenger(s). You currently have ${passengers.length}.`);
            setIsLoading(false);
            return;
        }
        // Detailed passenger validation
        for (let i = 0; i < passengers.length; i++) {
            const p = passengers[i];
            if (!p.name || !p.age || !p.gender) { setError(`Please complete details for Passenger ${i + 1}.`); setIsLoading(false); return; }
            if (isNaN(parseInt(p.age)) || p.age <= 0 || p.age > 120) { setError(`Please enter a valid age for Passenger ${i + 1}.`); setIsLoading(false); return; }
        }

        // --- Prepare Booking Data ---
        const bookingPayload = {
            schedule: scheduleId,
            numberOfSeats: numberOfSeats,
            seats: selectedSeatIds,
            fare: totalFare,
            paymentMethod: 'Cash', // Hardcoded for now
            passengerDetails: passengers.map(p => ({ name: p.name, age: parseInt(p.age), gender: p.gender })),
            contactDetails: { email: contactEmail, phone: contactPhone },
            boardingPointId: boardingPoint,
            deboardingPointId: droppingPoint,
        };

        console.log("Submitting Booking Payload:", bookingPayload);

        // --- TODO: Call createBooking service ---
        try {
             await new Promise(resolve => setTimeout(resolve, 1500));
             const bookingResult = { _id: `dummyBooking${Date.now()}`, ...bookingPayload }; // More unique dummy ID
             console.log("Booking successful (simulated):", bookingResult);
             navigate('/booking-confirmation', { state: { bookingDetails: bookingResult }, replace: true });
        } catch (err) {
             console.error("Booking submission error:", err);
             setError(err.message || 'Failed to create booking. Please try again.');
        } finally {
             setIsLoading(false);
        }
    };

    // Format date/time for display
    const formattedDate = date ? format(parseISO(date), 'eee, dd MMM yyyy') : 'N/A';
    const formattedDeparture = departureTime ? format(parseISO(departureTime), 'h:mm a') : 'N/A';
    const formattedArrival = arrivalTime ? format(parseISO(arrivalTime), 'h:mm a') : 'N/A';

    // Handle case where state might be missing on direct load/refresh
     if (!scheduleId || numberOfSeats === 0) {
         // You could show a message or redirect immediately
         // Redirecting is often better UX than showing a broken page
         // useEffect already handles this, but adding a check here prevents rendering with bad data
         return (
              <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                 <h2 className="text-xl font-semibold text-red-600 mb-4">Missing Booking Information</h2>
                 <p className="text-gray-700 mb-6">Could not load details. Please start your booking again.</p>
                 <Link to="/new-booking" className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors">Go to New Booking</Link>
             </div>
         );
     }


    return (
        <div className="min-h-screen bg-gray-100 pb-24"> {/* Increased bottom padding */}
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-200">
                <div className="container mx-auto p-4 flex items-center">
                    <button onClick={() => navigate(-1)} className="p-1 mr-3 text-gray-600 hover:text-primary" aria-label="Go back">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-800">Passenger Information</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto p-4 max-w-3xl">
                {/* Trip Summary Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-4 rounded-xl shadow-md border border-blue-200 mb-6">
                     <div className="flex justify-between items-center mb-2">
                         {/* *** Use ArrowRightLeft icon here *** */}
                         <h2 className="text-lg font-semibold text-primary">{origin} <ArrowRightLeft size={16} className="inline mx-1 opacity-70"/> {destination}</h2>
                         <span className="text-sm font-medium text-gray-600 bg-white px-2 py-0.5 rounded-full border">{formattedDate}</span>
                     </div>
                     <div className="flex flex-wrap justify-between items-center text-sm text-gray-700 gap-x-4 gap-y-1">
                        <span className="flex items-center"><Clock size={14} className="mr-1.5 opacity-70"/> {formattedDeparture} - {formattedArrival}</span>
                        <span className="flex items-center"><Bus size={14} className="mr-1.5 opacity-70"/> {vehicle?.model || 'Vehicle'}</span>
                        <span className="flex items-center"><Users size={14} className="mr-1.5 opacity-70"/> {numberOfSeats} Seat(s): {selectedSeatIds.join(', ')}</span>
                     </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Boarding Point Selection */}
                    <InfoCard title="Boarding Point" icon={MapPin}>
                        <div className="space-y-3">
                            {dummyBoardingPoints.map((point) => (
                                <label key={point.id} className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${boardingPoint === point.id ? 'bg-primary-lightest border-primary ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" name="boardingPoint" value={point.id} checked={boardingPoint === point.id} onChange={(e) => setBoardingPoint(e.target.value)} className="mt-1 mr-3 h-4 w-4 border-gray-300 text-primary focus:ring-primary" />
                                    <div>
                                        <p className="font-medium text-sm text-gray-800"><span className="font-semibold">{point.time}</span> - {point.name}</p>
                                        <p className="text-xs text-gray-500">{point.address}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </InfoCard>

                    {/* Dropping Point Selection */}
                     <InfoCard title="Dropping Point" icon={MapPin}>
                        <div className="space-y-3">
                            {dummyDroppingPoints.map((point) => (
                                <label key={point.id} className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${droppingPoint === point.id ? 'bg-primary-lightest border-primary ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" name="droppingPoint" value={point.id} checked={droppingPoint === point.id} onChange={(e) => setDroppingPoint(e.target.value)} className="mt-1 mr-3 h-4 w-4 border-gray-300 text-primary focus:ring-primary" />
                                     <div>
                                        <p className="font-medium text-sm text-gray-800"><span className="font-semibold">{point.time}</span> - {point.name}</p>
                                        <p className="text-xs text-gray-500">{point.address}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </InfoCard>

                    {/* Contact Details */}
                    <InfoCard title="Contact Details" icon={User}>
                        <p className="text-xs text-gray-500 mb-3">Ticket details will be sent here.</p>
                        <div className="space-y-3">
                             <div className="flex items-center gap-3 p-2 border-b">
                                <Mail size={16} className="text-gray-400 flex-shrink-0"/>
                                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email Address" required className="w-full text-sm border-none p-1 focus:ring-0" />
                             </div>
                             <div className="flex items-center gap-3 p-2">
                                <Phone size={16} className="text-gray-400 flex-shrink-0"/>
                                <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone Number" required className="w-full text-sm border-none p-1 focus:ring-0" />
                             </div>
                        </div>
                    </InfoCard>

                    {/* Passenger Details */}
                    <InfoCard title="Passenger Details" icon={Users}>
                         {/* Saved Passengers */}
                         <div className="mb-4">
                             <button type="button" onClick={() => setShowSavedPassengers(!showSavedPassengers)} className="text-sm text-primary hover:underline mb-2">
                                 {showSavedPassengers ? 'Hide Saved Passengers' : 'Select from Saved Passengers'}
                             </button>
                             {showSavedPassengers && (
                                 <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-gray-50">
                                     {dummySavedPassengers.length > 0 ? dummySavedPassengers.map(p => (
                                         <div key={p.id} className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-100">
                                             <span>{p.name} ({p.gender}, {p.age} yrs)</span>
                                             <button type="button" onClick={() => handleSelectSavedPassenger(p)} className="text-xs text-white bg-primary hover:bg-primary-dark px-2 py-0.5 rounded">Select</button>
                                         </div>
                                     )) : <p className="text-xs text-gray-500 text-center">No saved passengers found.</p>}
                                 </div>
                             )}
                         </div>

                         {/* Passenger Forms */}
                         {passengers.map((p, index) => (
                            <PassengerForm
                                key={index}
                                index={index}
                                passenger={p}
                                onChange={handlePassengerChange}
                                onRemove={handleRemovePassengerForm}
                                totalSeats={numberOfSeats}
                            />
                         ))}
                    </InfoCard>

                    {/* Error Display */}
                    {error && (
                        <div className="my-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Fixed Bottom Bar for Summary & Payment */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-10">
                        <div className="container mx-auto max-w-3xl flex justify-between items-center">
                            <div>
                                <span className="text-sm text-gray-600 block">Total Fare</span>
                                <span className="text-xl font-bold text-primary flex items-center">
                                    <IndianRupee size={18} className="mr-0.5"/>{totalFare.toFixed(0)}
                                </span>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Processing...' : 'Proceed to Pay'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PassengerDetailsPage;
