// src/pages/SeatSelectionPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Armchair, CircleUser, X, Check, User, Woman } from 'lucide-react'; // Icons for seats and driver
import { useAuth } from '../contexts/AuthContext'; // If needed for booking later

// --- Seat Component ---
const Seat = ({ seatData, isSelected, onSelect }) => {
  const { id, number, status, isFemaleOnly } = seatData; // status: 'available', 'booked'

  let seatStyles = 'border rounded-md w-12 h-12 md:w-14 md:h-14 flex flex-col items-center justify-center transition-colors duration-200 relative';
  let icon = <Armchair size={20} />;
  let label = number;
  let selectable = false;

  if (status === 'driver') {
    seatStyles += ' bg-gray-300 border-gray-400 cursor-not-allowed';
    icon = <CircleUser size={20} className="text-gray-600" />;
    label = 'Driver';
  } else if (status === 'booked') {
    seatStyles += ' bg-gray-400 border-gray-500 text-white cursor-not-allowed';
    icon = <X size={16} />; // Indicate booked
  } else if (isFemaleOnly && !isSelected) { // Available but female preference/only
    seatStyles += ' bg-pink-100 border-pink-300 text-pink-700 cursor-pointer hover:bg-pink-200';
    icon = <Woman size={20} />;
    selectable = true;
  } else if (status === 'available') {
     if (isSelected) {
        seatStyles += ' bg-accent border-accent-dark text-white ring-2 ring-offset-1 ring-accent';
        icon = <Check size={16} />; // Indicate selected
        selectable = true; // Can de-select
     } else {
        seatStyles += ' bg-green-100 border-green-400 text-green-800 cursor-pointer hover:bg-green-200';
        selectable = true;
     }
  }

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(id); // Pass seat ID back
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!selectable}
      className={seatStyles}
      aria-label={`Seat ${label}${status !== 'available' ? ` (${status})` : ''}${isFemaleOnly ? ' (Female)' : ''}`}
      title={`Seat ${label}${status !== 'available' ? ` (${status})` : ''}${isFemaleOnly ? ' (Female)' : ''}`}
    >
      {icon}
      <span className="text-xs font-medium mt-0.5">{label}</span>
       {/* Optional: Add a small indicator for female seats */}
       {isFemaleOnly && status !== 'driver' && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-pink-500 rounded-full border border-white"></span>
        )}
    </button>
  );
};

// --- Main Page Component ---
function SeatSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  // Get schedule details passed from previous page (SearchResultsPage)
  // Replace with actual data fetching if needed
  const scheduleDetails = location.state || {
      scheduleId: 'DUMMY_SCHEDULE_ID',
      origin: 'Lucknow',
      destination: 'Kanpur',
      date: '2025-05-10',
      departureTime: '2025-05-10T08:00:00.000Z',
      arrivalTime: '2025-05-10T12:45:00.000Z',
      farePerSeat: 420,
      vehicle: { model: 'Mini Bus' }
  };

  // --- Seat Layout Definition (1 Driver + 6 Passengers) ---
  // status: 'available', 'booked', 'driver'
  // isFemaleOnly: boolean
  // This structure represents the physical layout
  const initialSeatLayout = [
    // Front Row
    { id: 'F1', number: 'F1', status: 'available', isFemaleOnly: false }, // Passenger Window
    { id: 'DR', number: 'DR', status: 'driver', isFemaleOnly: false },   // Driver
    // Middle Row
    { id: 'M1', number: 'M1', status: 'available', isFemaleOnly: false }, // Window
    { id: 'M2', number: 'M2', status: 'booked', isFemaleOnly: false },    // Middle
    { id: 'M3', number: 'M3', status: 'available', isFemaleOnly: true }, // Window (Female example)
    // Back Row
    { id: 'B1', number: 'B1', status: 'available', isFemaleOnly: false }, // Window
    { id: 'B2', number: 'B2', status: 'booked', isFemaleOnly: true },    // Window (Booked Female example)
  ];

  const [seats, setSeats] = useState(initialSeatLayout); // Holds the current state of all seats
  const [selectedSeats, setSelectedSeats] = useState([]); // Array of selected seat IDs
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For potential API calls

  // TODO: Fetch actual booked/female status for the scheduleId
  useEffect(() => {
    const fetchSeatStatus = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Replace with API call: fetchSeatsForSchedule(scheduleDetails.scheduleId, token)
        // The API should return an array of seat objects with their current status ('booked', 'available', 'female_reserved', etc.)
        console.log("Fetching seat status for schedule:", scheduleDetails.scheduleId);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        // For now, we use the initialSeatLayout which includes dummy booked/female seats
        // In a real scenario, you'd update the 'seats' state here based on API response
        // Example:
        // const fetchedSeats = await fetchSeatsForSchedule(scheduleDetails.scheduleId, token);
        // setSeats(updateLayoutWithFetchedStatus(initialSeatLayout, fetchedSeats));

      } catch (err) {
        console.error("Failed to fetch seat status:", err);
        setError("Could not load seat availability. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

     if (scheduleDetails.scheduleId !== 'DUMMY_SCHEDULE_ID') { // Avoid fetching for dummy data
         fetchSeatStatus();
     } else {
         setIsLoading(false); // No loading needed for dummy data
     }
  }, [scheduleDetails.scheduleId, token]);


  // Handle seat selection/deselection
  const handleSeatSelect = (seatId) => {
    setSelectedSeats(prevSelected => {
      if (prevSelected.includes(seatId)) {
        // Deselect
        return prevSelected.filter(id => id !== seatId);
      } else {
        // Select - Add validation for max seats if needed
        // const maxSeatsAllowed = location.state?.passengers || 1; // Get passenger count if passed
        // if (prevSelected.length >= maxSeatsAllowed) {
        //   setError(`You can only select ${maxSeatsAllowed} seat(s).`);
        //   return prevSelected;
        // }
        setError(''); // Clear error on valid selection
        return [...prevSelected, seatId];
      }
    });
  };

  // Calculate total fare for selected seats
  const totalFare = selectedSeats.length * (scheduleDetails.farePerSeat || 0);

  // Handle confirmation
  const handleConfirmSeats = () => {
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat.");
      return;
    }
    console.log("Selected Seats:", selectedSeats);
    console.log("Total Fare:", totalFare);
    // Navigate to the next step (e.g., payment or booking summary)
    // Pass selected seats, schedule details, fare, etc.
    navigate('/booking-confirmation', { // Or payment page
        state: {
            ...scheduleDetails, // Pass existing schedule details
            selectedSeatIds: selectedSeats,
            numberOfSeats: selectedSeats.length,
            totalFare: totalFare,
        }
    });
     alert(`Selected seats: ${selectedSeats.join(', ')}. Total Fare: ₹${totalFare}. Navigation to next step not fully implemented.`);
  };

  // Helper to get seat data by ID
  const getSeatById = (id) => seats.find(seat => seat.id === id);

  return (
    <div className="min-h-screen bg-gray-100 pb-20"> {/* Add padding bottom for confirm button */}
      {/* Header */}
       <div className="bg-primary text-white p-4 shadow-md sticky top-0 z-20">
           <div className="container mx-auto flex items-center">
                <button onClick={() => navigate(-1)} className="p-1 mr-2"> {/* Go back button */}
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-grow text-center">
                    <h1 className="text-lg font-semibold truncate">{scheduleDetails.origin} to {scheduleDetails.destination}</h1>
                    <p className="text-sm opacity-90">{scheduleDetails.date ? format(parseISO(scheduleDetails.date), 'eee, dd MMM yyyy') : ''}</p>
                </div>
                <div className="w-8"></div> {/* Spacer */}
           </div>
       </div>

      <div className="container mx-auto p-4 mt-4 max-w-md"> {/* Constrain width for seat layout */}

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs mb-6 bg-white p-3 rounded-lg shadow-sm border">
          <div className="flex items-center"><span className="w-4 h-4 rounded bg-green-100 border border-green-400 mr-1.5"></span>Available</div>
          <div className="flex items-center"><span className="w-4 h-4 rounded bg-gray-400 border border-gray-500 mr-1.5"></span>Booked</div>
          <div className="flex items-center"><span className="w-4 h-4 rounded bg-pink-100 border border-pink-300 mr-1.5"></span>Female</div>
          <div className="flex items-center"><span className="w-4 h-4 rounded bg-accent border-accent-dark mr-1.5"></span>Selected</div>
          <div className="flex items-center"><span className="w-4 h-4 rounded bg-gray-300 border border-gray-400 mr-1.5 flex items-center justify-center"><CircleUser size={10}/></span>Driver</div>
        </div>

        {/* Loading State */}
        {isLoading && <p className="text-center text-gray-600">Loading seat availability...</p>}

        {/* Error State */}
        {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}

        {/* Seat Layout */}
        {!isLoading && !error && (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-4">Select your desired seat(s)</p>

            {/* Steering Wheel Indicator */}
            <div className="w-8 h-8 border-2 border-gray-500 rounded-full flex items-center justify-center mb-4 self-end mr-4 md:mr-6">
                <CircleUser size={18} className="text-gray-500" />
            </div>

            <div className="space-y-4 w-full max-w-[250px]"> {/* Adjust max-width as needed */}
              {/* Front Row (1 passenger + 1 driver) */}
              <div className="flex justify-between items-center">
                <Seat
                  seatData={getSeatById('F1')}
                  isSelected={selectedSeats.includes('F1')}
                  onSelect={handleSeatSelect}
                />
                <Seat
                  seatData={getSeatById('DR')}
                  isSelected={false} // Driver cannot be selected
                  onSelect={null}
                />
              </div>

              {/* Middle Row (3 seats) */}
              <div className="flex justify-between items-center">
                 <Seat
                  seatData={getSeatById('M1')}
                  isSelected={selectedSeats.includes('M1')}
                  onSelect={handleSeatSelect}
                />
                 <Seat
                  seatData={getSeatById('M2')}
                  isSelected={selectedSeats.includes('M2')}
                  onSelect={handleSeatSelect}
                />
                 <Seat
                  seatData={getSeatById('M3')}
                  isSelected={selectedSeats.includes('M3')}
                  onSelect={handleSeatSelect}
                />
              </div>

              {/* Back Row (2 seats) */}
              <div className="flex justify-between items-center">
                 <Seat
                  seatData={getSeatById('B1')}
                  isSelected={selectedSeats.includes('B1')}
                  onSelect={handleSeatSelect}
                />
                 <Seat
                  seatData={getSeatById('B2')}
                  isSelected={selectedSeats.includes('B2')}
                  onSelect={handleSeatSelect}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Confirmation Bar */}
      {!isLoading && !error && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 border-t">
            <div className="container mx-auto flex justify-between items-center max-w-md">
                <div>
                    <p className="text-sm text-gray-600">Selected Seats: <span className="font-semibold">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span></p>
                    <p className="text-lg font-bold text-primary">Total Fare: <IndianRupee size={16} className="inline mb-0.5"/>{totalFare.toFixed(0)}</p>
                </div>
                <button
                    onClick={handleConfirmSeats}
                    disabled={selectedSeats.length === 0}
                    className="px-6 py-2 bg-accent text-white font-semibold rounded-lg shadow-md hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Confirm
                </button>
            </div>
        </div>
      )}
    </div>
  );
}

export default SeatSelectionPage;
