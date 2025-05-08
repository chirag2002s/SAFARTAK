// src/pages/PassengerDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, MapPin, User, Mail, Phone, Users, Calendar, Clock, IndianRupee, Bus, Trash2, PlusCircle, ArrowRightLeft, CheckCircle, Loader2 } from 'lucide-react';

// Import booking/payment services (assuming they exist)
// import { createBooking } from '../services/bookingService';
// import { createRazorpayOrder } from '../services/paymentService';

// --- Dummy Data (Replace with API calls later) ---
const getDummyPoints = (city) => { /* ... Keep dummy data function as is ... */
    switch (city?.toLowerCase()) {
        case 'lucknow': return [ { id: 'LKO1', name: 'Alambagh Bus Station', time: '06:30 AM', address: 'Near Metro Pillar 12' }, { id: 'LKO2', name: 'Charbagh Railway Station Area', time: '06:45 AM', address: 'Opposite Main Entrance' }, { id: 'LKO3', name: 'Polytechnic Chauraha', time: '07:00 AM', address: 'Near Metro Station Gate 2' }, { id: 'LKO4', name: 'Gomti Nagar Extension', time: '07:15 AM', address: 'Near Sahara Hospital' }, ];
        case 'kanpur': return [ { id: 'KNP1', name: 'Jhakarkati Bus Station', time: '11:00 AM', address: 'Main Platform Area' }, { id: 'KNP2', name: 'Rama Devi Chauraha', time: '10:45 AM', address: 'Highway Crossing' }, { id: 'KNP3', name: 'Kalyanpur Crossing', time: '10:30 AM', address: 'Near IIT Gate' }, ];
        case 'agra': return [ { id: 'AGR1', name: 'Idgah Bus Stand', time: '09:00 AM', address: 'Platform 3' }, { id: 'AGR2', name: 'ISBT Agra', time: '09:15 AM', address: 'Near Main Gate' }, { id: 'AGR3', name: 'Bhagwan Talkies Crossing', time: '09:30 AM', address: 'Near Flyover' }, ];
        case 'noida': return [ { id: 'NOI1', name: 'Noida Sector 62 Metro', time: '14:00 PM', address: 'Gate 1' }, { id: 'NOI2', name: 'Botanical Garden Metro', time: '14:15 PM', address: 'Gate 3A' }, { id: 'NOI3', name: 'Pari Chowk (Greater Noida)', time: '14:30 PM', address: 'Near Expo Mart' }, ];
        default: console.warn(`No dummy points defined for city: ${city}`); return [{ id: 'DEF1', name: `Main Point ${city || 'N/A'}`, time: 'N/A', address: 'Default address' }];
    }
};
const dummySavedPassengers = [ { id: 'p1', name: 'Ashish Shukla', age: 21, gender: 'Male' }, { id: 'p2', name: 'BN Shukla', age: 63, gender: 'Male' }, { id: 'p3', name: 'Karishma Pandey', age: 31, gender: 'Female' }, ];
// ----------------------------------------------------

// --- Helper Functions ---
const formatDate = (dateString) => { /* ... Keep as is ... */
    try { if (!dateString || typeof dateString !== 'string') throw new Error("Invalid date string"); return format(parseISO(dateString), 'eee, dd MMM yy'); } catch(e) { console.error("Error formatting date:", dateString, e); return "Invalid Date"; }
};
const formatTime = (timeString) => { /* ... Keep as is ... */
     try { if (!timeString || typeof timeString !== 'string') throw new Error("Invalid time string"); return format(parseISO(timeString), 'h:mm a'); } catch(e) { console.error("Error formatting time:", timeString, e); return "Invalid Time"; }
};

// --- Helper Components ---
const InfoCard = ({ children, title, icon: Icon }) => ( /* ... Keep as is ... */
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 mb-6"> <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"> <Icon size={20} className="mr-2 text-primary opacity-80" /> {title} </h2> {children} </div>
);

const PassengerForm = ({ index, passenger, onChange, onRemove, totalSeats }) => { /* ... Keep as is ... */
    console.log(`[PassengerForm ${index}] Rendering. Received passenger prop:`, passenger);
    const safePassenger = passenger || {};
    const handleInputChange = (e) => { onChange(index, e.target.name, e.target.value); };
    return ( <div className="p-4 border border-gray-200 rounded-lg mb-3 bg-gray-50/50 relative"> <p className="text-sm font-medium text-gray-600 mb-3">Passenger {index + 1} (Seat {safePassenger.seatId || 'N/A'})</p> {totalSeats > 1 && ( <button type="button" onClick={() => onRemove(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors" title="Remove Passenger" > <Trash2 size={16} /> </button> )} <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"> <div className="sm:col-span-3"> <label htmlFor={`name-${index}`} className="block text-xs font-medium text-gray-500 mb-1">Name</label> <input type="text" id={`name-${index}`} name="name" value={safePassenger.name || ''} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Full Name" /> </div> <div> <label htmlFor={`age-${index}`} className="block text-xs font-medium text-gray-500 mb-1">Age</label> <input type="number" id={`age-${index}`} name="age" value={safePassenger.age || ''} onChange={handleInputChange} required min="1" max="120" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Age" /> </div> <div> <label htmlFor={`gender-${index}`} className="block text-xs font-medium text-gray-500 mb-1">Gender</label> <select id={`gender-${index}`} name="gender" value={safePassenger.gender || ''} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"> <option value="" disabled>Select</option> <option value="Male">Male</option> <option value="Female">Female</option> <option value="Other">Other</option> </select> </div> </div> </div> );
};

const PointSelector = ({ title, points, selectedPoint, onSelect, pointType }) => { /* ... Keep as is ... */
    if (!points || points.length === 0) { return <p className="text-sm text-gray-500 px-3">No {pointType} points available for this route.</p>; }
    return ( <div className="mb-6"> <h3 className="text-md font-semibold text-primary mb-3 px-1">{title}</h3> <div className="space-y-2 max-h-60 overflow-y-auto pr-2"> {points.map((point) => ( <label key={point.id} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out ${selectedPoint === point.id ? 'bg-primary bg-opacity-10 border-primary ring-1 ring-primary shadow-sm' : 'border-gray-300 hover:bg-gray-50'}`}> <input type="radio" name={`${pointType}Point`} value={point.id} checked={selectedPoint === point.id} onChange={() => onSelect(point.id)} className="form-radio h-4 w-4 text-primary focus:ring-primary mr-3 flex-shrink-0"/> <div className="flex-grow"> <span className="text-sm font-medium text-gray-800">{point.name}</span> {point.time && point.time !== 'N/A' && (<span className="block text-xs text-gray-500 mt-0.5">Est. Time: {point.time}</span>)} {point.address && (<span className="block text-xs text-gray-500 mt-0.5">{point.address}</span>)} </div> {selectedPoint === point.id && <CheckCircle size={18} className="text-primary flex-shrink-0 ml-2" />} </label> ))} </div> </div> );
};
// --- End Helper Components ---


// --- Main Page Component ---
function PassengerDetailsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token } = useAuth();

    // --- State ---
    const { scheduleId, origin, destination, date, departureTime, arrivalTime, farePerSeat, vehicle, selectedSeatIds = [], totalFare = 0 } = location.state || {};
    const numberOfSeats = selectedSeatIds.length;
    const [passengers, setPassengers] = useState([]);
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [sendUpdates, setSendUpdates] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('Online');
    const [error, setError] = useState('');
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [isDataValid, setIsDataValid] = useState(false);
    const [boardingPoints, setBoardingPoints] = useState([]);
    const [deboardingPoints, setDeboardingPoints] = useState([]);
    const [selectedBoardingPoint, setSelectedBoardingPoint] = useState('');
    const [selectedDeboardingPoint, setSelectedDeboardingPoint] = useState('');
    const [showSavedPassengers, setShowSavedPassengers] = useState(false);


    // Initialize component state and validate incoming data
    useEffect(() => { /* ... Keep as is ... */
        console.log("[PassengerDetailsPage] useEffect running. location.state:", location.state);
        let dataMissing = false;
        if (!scheduleId || !Array.isArray(selectedSeatIds) || selectedSeatIds.length === 0 || !origin || !destination || !date || !departureTime || !arrivalTime || totalFare === undefined) { console.error("Missing critical booking/schedule data in location state:", location.state); setError("Booking session data is missing or invalid. Please start the booking process again."); dataMissing = true; }
        else if (!token) { console.error("Auth token is missing."); setError("Authentication error. Please log in again."); dataMissing = true; }
        if (dataMissing) { setIsDataValid(false); }
        else { setIsDataValid(true); setError(''); const initialPassengers = selectedSeatIds.map(seatId => ({ seatId: seatId, name: '', age: '', gender: '' })); console.log("[PassengerDetailsPage] Initializing passengers state:", initialPassengers); setPassengers(initialPassengers); setContactEmail(user?.email || ''); setContactPhone(user?.phone || ''); const availableBoarding = getDummyPoints(origin); const availableDeboarding = getDummyPoints(destination); setBoardingPoints(availableBoarding); setDeboardingPoints(availableDeboarding); if (availableBoarding.length > 0 && !selectedBoardingPoint) setSelectedBoardingPoint(availableBoarding[0].id); if (availableDeboarding.length > 0 && !selectedDeboardingPoint) setSelectedDeboardingPoint(availableDeboarding[0].id); }
    }, [location.state, user, token, navigate]);


    // Handle passenger input changes
    const handlePassengerChange = (index, fieldName, fieldValue) => { /* ... Keep as is ... */
        setPassengers(prev => { const updatedPassengers = [...prev]; if (updatedPassengers[index]) { updatedPassengers[index] = { ...updatedPassengers[index], [fieldName]: fieldValue }; } console.log(`[PassengerDetailsPage] handlePassengerChange - index: ${index}, field: ${fieldName}, value: ${fieldValue}, newState:`, updatedPassengers); return updatedPassengers; }); setError('');
    };

    // Handle removing a passenger form
    const handleRemovePassengerForm = (indexToRemove) => { /* ... Keep as is ... */
         if (passengers.length > 1) { setPassengers(prev => prev.filter((_, index) => index !== indexToRemove)); }
     };

     // Handle selecting saved passengers
    const handleSelectSavedPassenger = (savedPassenger) => { /* ... Keep as is ... */
        const firstEmptyIndex = passengers.findIndex(p => !p.name && !p.age && !p.gender);
        if (firstEmptyIndex !== -1) { handlePassengerChange(firstEmptyIndex, 'name', savedPassenger.name); handlePassengerChange(firstEmptyIndex, 'age', savedPassenger.age); handlePassengerChange(firstEmptyIndex, 'gender', savedPassenger.gender); }
        else { setError("All passenger slots filled. Cannot add saved passenger."); setTimeout(() => setError(''), 3000); }
        setShowSavedPassengers(false);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isDataValid) { setError("Cannot proceed due to missing booking data."); return; }
        setError(''); setLoadingSubmit(true);
        // --- Validation ---
        if (!selectedBoardingPoint) { setError('Please select a boarding point.'); setLoadingSubmit(false); return; }
        if (!selectedDeboardingPoint) { setError('Please select a dropping point.'); setLoadingSubmit(false); return; }
        const emailTrimmed = contactEmail?.trim(); const phoneTrimmed = contactPhone?.trim();
        if (!emailTrimmed || !phoneTrimmed || !/^\S+@\S+\.\S+$/.test(emailTrimmed)) { setError('Please provide valid contact email & phone.'); setLoadingSubmit(false); return; }
        if (passengers.length !== numberOfSeats) { setError(`Please provide details for exactly ${numberOfSeats} passenger(s). You currently have ${passengers.length}.`); setLoadingSubmit(false); return; }
        for (let i = 0; i < passengers.length; i++) { const p = passengers[i]; if (!p.name?.trim() || !p.age || !p.gender) { setError(`Please complete details for Passenger ${i + 1} (Seat ${p.seatId}).`); setLoadingSubmit(false); return; } if (isNaN(parseInt(p.age)) || p.age <= 0 || p.age > 120) { setError(`Please enter a valid age for Passenger ${i + 1}.`); setLoadingSubmit(false); return; } }
        // --- Prepare Booking Data ---
        const bookingPayload = { schedule: scheduleId, numberOfSeats: numberOfSeats, seats: selectedSeatIds, fare: totalFare, paymentMethod: paymentMethod, passengerDetails: passengers.map(({ seatId, ...details }) => ({...details, age: parseInt(details.age)})), contactDetails: { email: emailTrimmed, phone: phoneTrimmed }, boardingPointId: selectedBoardingPoint, deboardingPointId: selectedDeboardingPoint, };
        console.log("Submitting Booking Payload:", bookingPayload);

        // --- Handle Booking based on Payment Method ---
        if (paymentMethod === 'Cash') {
            try {
                console.log("Submitting Cash Booking:", bookingPayload); if (!token) throw new Error("Authentication token missing.");
                // *** TODO: Replace simulation with actual API call ***
                await new Promise(resolve => setTimeout(resolve, 1000));
                const createdBooking = { _id: `dummyBooking${Date.now()}`, ...bookingPayload, status: 'Confirmed', paymentStatus: 'Pending', schedule: { routeOrigin: origin, routeDestination: destination, departureDateTime: departureTime, arrivalDateTime: arrivalTime, vehicle: vehicle } }; // Add schedule info for confirmation page
                console.log("Cash booking successful (simulated). Navigating with data:", createdBooking);
                // *** ADD LOG BEFORE NAVIGATE ***
                console.log("Navigating to /booking-confirmation with state:", { bookingDetails: createdBooking });
                navigate('/booking-confirmation', { state: { bookingDetails: createdBooking }, replace: true });
            } catch (err) { console.error("Cash booking failed:", err); setError(err.message || 'Failed to create cash booking.'); }
            finally { setLoadingSubmit(false); }
        } else if (paymentMethod === 'Online') {
            try {
                console.log("Initiating Online Payment for:", bookingPayload); if (!token) throw new Error("Authentication token missing.");
                // *** TODO: Replace simulation with actual API call ***
                await new Promise(resolve => setTimeout(resolve, 500));
                const orderResponse = { order: { id: `dummy_order_${Date.now()}`, amount: totalFare * 100, currency: 'INR' }, razorpayKeyId: 'YOUR_RAZORPAY_KEY_ID' };
                const { order, razorpayKeyId } = orderResponse;
                if (!order || !order.id || !razorpayKeyId) { throw new Error("Failed to create payment order from backend."); }
                console.log("Razorpay Order created (simulated):", order);
                const options = {
                    key: razorpayKeyId, amount: order.amount, currency: order.currency, name: "Safartak Booking", description: `Booking: ${origin} to ${destination} (${selectedSeatIds.length} seats)`, order_id: order.id,
                    handler: async function (response) {
                        console.log("Razorpay payment successful, creating booking with verification data:", response); setLoadingSubmit(true); setError('');
                        const finalBookingData = { ...bookingPayload, paymentMethod: 'Online', razorpay_payment_id: response.razorpay_payment_id, razorpay_order_id: order.id, razorpay_signature: response.razorpay_signature };
                        try {
                            // *** TODO: Replace simulation with actual API call ***
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            const createdBooking = { _id: `dummyBooking${Date.now()}`, ...finalBookingData, status: 'Confirmed', paymentStatus: 'Success', schedule: { routeOrigin: origin, routeDestination: destination, departureDateTime: departureTime, arrivalDateTime: arrivalTime, vehicle: vehicle } }; // Add schedule info
                            console.log("Online booking successful (simulated). Navigating with data:", createdBooking);
                             // *** ADD LOG BEFORE NAVIGATE ***
                            console.log("Navigating to /booking-confirmation with state:", { bookingDetails: createdBooking });
                            navigate('/booking-confirmation', { state: { bookingDetails: createdBooking }, replace: true });
                        } catch (bookingErr) { console.error("Booking creation after payment failed:", bookingErr); setError(bookingErr.message || 'Payment successful, but failed to save booking.'); setLoadingSubmit(false); }
                    },
                    prefill: { name: user?.name || '', email: contactEmail, contact: contactPhone }, notes: { schedule_id: scheduleId, seats: selectedSeatIds.join(',') }, theme: { color: "#E10098" }, modal: { ondismiss: () => { console.log('Razorpay modal dismissed.'); setLoadingSubmit(false); } }
                };
                if (!window.Razorpay) { throw new Error("Razorpay SDK not loaded."); } const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', (response) => { console.error("Razorpay payment failed:", response.error); setError(`Payment Failed: ${response.error.description || response.error.reason || 'Unknown error'}`); setLoadingSubmit(false); });
                rzp.open();
            } catch (err) { console.error("Error initiating online payment:", err); setError(err.message || 'Could not start online payment process.'); setLoadingSubmit(false); }
        } else { setError('Invalid payment method selected.'); setLoadingSubmit(false); }
    };


    // Format date/time for display
    const formattedDate = date ? formatDate(date) : 'N/A';
    const formattedDeparture = departureTime ? formatTime(departureTime) : 'N/A';
    const formattedArrival = arrivalTime ? formatTime(arrivalTime) : 'N/A';

    // Handle case where state might be missing
     if (!isDataValid) {
         return ( <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center"> <h2 className="text-xl font-semibold text-red-600 mb-4">Missing Booking Information</h2> <p className="text-gray-700 mb-6">{error || "Could not load details. Please start your booking again."}</p> <Link to="/new-booking" className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors">Go to New Booking</Link> </div> );
     }


    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-20"> <div className="container mx-auto p-4 flex items-center"> <button onClick={() => navigate(-1)} className="p-1 mr-2 text-gray-600 hover:text-primary" aria-label="Go back"> <ArrowLeft size={24} /> </button> <h1 className="text-xl font-semibold text-gray-800">Passenger &amp; Pickup Details</h1> </div> </div>

            {/* Main Content */}
            <div className="container mx-auto p-4 mt-4 max-w-2xl">
                {/* Trip Summary Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-4 rounded-xl shadow-md border border-blue-200 mb-6"> <div className="flex justify-between items-center mb-2"> <h2 className="text-lg font-semibold text-primary">{origin} <ArrowRightLeft size={16} className="inline mx-1 opacity-70"/> {destination}</h2> <span className="text-sm font-medium text-gray-600 bg-white px-2 py-0.5 rounded-full border">{formattedDate}</span> </div> <div className="flex flex-wrap justify-between items-center text-sm text-gray-700 gap-x-4 gap-y-1"> <span className="flex items-center"><Clock size={14} className="mr-1.5 opacity-70"/> {formattedDeparture} - {formattedArrival}</span> <span className="flex items-center"><Bus size={14} className="mr-1.5 opacity-70"/> {vehicle?.model || 'Vehicle'}</span> <span className="flex items-center"><Users size={14} className="mr-1.5 opacity-70"/> {numberOfSeats} Seat(s): {selectedSeatIds.join(', ')}</span> </div> </div>

                <form onSubmit={handleSubmit}>
                    {/* Boarding/Deboarding Points Section */}
                    <InfoCard title="Pickup & Drop Points" icon={MapPin}> <PointSelector title="Select Boarding Point" points={boardingPoints} selectedPoint={selectedBoardingPoint} onSelect={setSelectedBoardingPoint} pointType="boarding" /> <div className="mt-4 pt-4 border-t border-gray-200"> <PointSelector title="Select Deboarding Point" points={deboardingPoints} selectedPoint={selectedDeboardingPoint} onSelect={setSelectedDeboardingPoint} pointType="deboarding" /> </div> </InfoCard>

                    {/* Passenger Details Section */}
                     <InfoCard title="Passenger Details" icon={Users}>
                         {/* Saved Passengers */}
                         <div className="mb-4"> <button type="button" onClick={() => setShowSavedPassengers(!showSavedPassengers)} className="text-sm text-primary hover:underline mb-2"> {showSavedPassengers ? 'Hide Saved Passengers' : 'Select from Saved Passengers'} </button> {showSavedPassengers && ( <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-gray-50"> {dummySavedPassengers.length > 0 ? dummySavedPassengers.map(p => ( <div key={p.id} className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-100"> <span>{p.name} ({p.gender}, {p.age} yrs)</span> <button type="button" onClick={() => handleSelectSavedPassenger(p)} className="text-xs text-white bg-primary hover:bg-primary-dark px-2 py-0.5 rounded">Select</button> </div> )) : <p className="text-xs text-gray-500 text-center">No saved passengers found.</p>} </div> )} </div>
                         {/* Passenger Forms */}
                         {passengers.map((passenger, index) => (
                            <PassengerForm
                                key={passenger.seatId || index}
                                index={index}
                                passenger={passenger}
                                onChange={handlePassengerChange}
                                onRemove={handleRemovePassengerForm}
                                totalSeats={numberOfSeats}
                            />
                         ))}
                    </InfoCard>

                    {/* Contact Details Section */}
                    <InfoCard title="Contact Details" icon={User}> <p className="text-xs text-gray-500 mb-3">We'll send booking confirmation and updates here.</p> <div className="space-y-4"> <div> <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label> <div className="relative"> <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/> <input type="email" id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required placeholder="Enter your email" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"/> </div> </div> <div> <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label> <div className="relative"> <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/> <input type="tel" id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required placeholder="Enter your phone number" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"/> </div> </div> <div className="flex items-center"> <input id="sendUpdates" name="sendUpdates" type="checkbox" checked={sendUpdates} onChange={(e) => setSendUpdates(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"/> <label htmlFor="sendUpdates" className="ml-2 block text-sm text-gray-700"> Send me trip updates via Email/SMS (Optional) </label> </div> </div> </InfoCard>

                    {/* Payment Method Selection */}
                     <InfoCard title="Payment Method" icon={IndianRupee}> <div className="space-y-3"> <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'Online' ? 'bg-primary-lightest border-primary ring-1 ring-primary' : 'border-gray-300 hover:bg-gray-50'}`}> <input type="radio" name="paymentMethod" value="Online" checked={paymentMethod === 'Online'} onChange={(e) => setPaymentMethod(e.target.value)} className="form-radio h-4 w-4 text-primary focus:ring-primary mr-3"/> <span className="text-sm font-medium text-gray-800">Pay Online (Credit/Debit/UPI via Razorpay)</span> </label> <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'Cash' ? 'bg-primary-lightest border-primary ring-1 ring-primary' : 'border-gray-300 hover:bg-gray-50'}`}> <input type="radio" name="paymentMethod" value="Cash" checked={paymentMethod === 'Cash'} onChange={(e) => setPaymentMethod(e.target.value)} className="form-radio h-4 w-4 text-primary focus:ring-primary mr-3"/> <span className="text-sm font-medium text-gray-800">Pay with Cash (Upon Boarding)</span> </label> </div> </InfoCard>

                    {/* Display Error */}
                    {error && ( <div className="my-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm text-center"> {error} </div> )}

                    {/* Sticky Footer for Fare & Button */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] p-4 z-10"> <div className="container mx-auto flex justify-between items-center max-w-2xl"> <div> <p className="text-sm text-gray-600">Total Payable</p> <p className="text-xl font-bold text-primary flex items-center"> <IndianRupee size={18} className="mr-0.5"/>{totalFare?.toFixed(0) ?? '0'} </p> </div> <button type="submit" disabled={loadingSubmit} className="min-w-[180px] flex justify-center items-center px-6 py-3 bg-accent text-white font-semibold rounded-lg shadow-md hover:bg-accent-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" > {loadingSubmit ? <Loader2 className="animate-spin h-5 w-5" /> : (paymentMethod === 'Online' ? 'Continue to Pay' : 'Confirm Cash Booking')} </button> </div> </div>
                </form>
            </div>
        </div>
    );
}

export default PassengerDetailsPage;
