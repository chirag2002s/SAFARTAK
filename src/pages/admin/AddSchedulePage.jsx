// src/pages/admin/AddSchedulePage.jsx (Auto Fare Calc)
import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
import { createSchedule } from '../../services/scheduleService'; // Adjust path if needed
import { getAllVehicles } from '../../services/vehicleService'; // To populate dropdown
import { getAllDrivers } from '../../services/driverService'; // To populate dropdown

// --- Configuration Data (Copied from NewBookingPage - consider moving to shared config) ---
const UTTAR_PRADESH_CITIES = [ "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Jhansi", "Muzaffarnagar", "Mathura", "Ayodhya", "Rampur", "Shahjahanpur" ];
const DISTANCE_MATRIX = { "Agra-Lucknow": 335, "Agra-Kanpur": 285, "Kanpur-Lucknow": 95, "Ghaziabad-Lucknow": 480, "Ghaziabad-Meerut": 50, "Lucknow-Prayagraj": 210, "Lucknow-Varanasi": 320, "Meerut-Noida": 65, "Noida-Lucknow": 500, "Prayagraj-Varanasi": 125, "Kanpur-Prayagraj": 200, "Agra-Noida": 180 };
const BASE_FARE = 50; const RATE_PER_KM = 2.5; const GST_MULTIPLIER = 1.05;
const calculateSingleTicketFare = (origin, destination) => {
    if (!origin || !destination || origin === destination) return 0;
    const key = [origin, destination].sort().join('-');
    const distance = DISTANCE_MATRIX[key];
    if (distance === undefined || distance === null) { console.warn(`Distance not found for route: ${key}.`); return 0; }
    const subTotal = BASE_FARE + (distance * RATE_PER_KM);
    const finalFare = subTotal * GST_MULTIPLIER;
    return Math.round(finalFare * 100) / 100;
};
// ------------------------------------------------------------------------------------

function AddSchedulePage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    routeOrigin: '',
    routeDestination: '',
    departureDateTime: '',
    arrivalDateTime: '',
    vehicleId: '',
    driverId: '',
    // farePerSeat: '', // Removed manual fare input
  });

  // State for dropdown data
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // UI State
  const [loading, setLoading] = useState(false); // For form submission
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Destructure form data
  const { routeOrigin, routeDestination, departureDateTime, arrivalDateTime, vehicleId, driverId } = formData;

  // --- Calculate farePerSeat automatically based on selected route ---
  const calculatedFarePerSeat = useMemo(() => {
      return calculateSingleTicketFare(routeOrigin, routeDestination);
  }, [routeOrigin, routeDestination]);
  // -----------------------------------------------------------------

  // Fetch vehicles and drivers for dropdowns on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!token) return;
      setLoadingDropdowns(true);
      try {
        const [vehicleData, driverData] = await Promise.all([
          getAllVehicles(token),
          getAllDrivers(token)
        ]);
        setVehicles(vehicleData.filter(v => v.isActive) || []);
        setDrivers(driverData || []);
      } catch (err) {
        setError('Failed to load vehicles or drivers for selection.');
        console.error("Dropdown data fetch error:", err);
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchDropdownData();
  }, [token]);

  // Handle input changes
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!token) { setError('Authentication required.'); setLoading(false); return; }

    // --- Use calculated fare ---
    const fareToSubmit = calculatedFarePerSeat;
    // -------------------------

    // Prepare data for API
    const scheduleData = {
      routeOrigin,
      routeDestination,
      departureDateTime,
      arrivalDateTime,
      vehicleId,
      driverId,
      farePerSeat: fareToSubmit, // Use the calculated fare
    };

    // Basic validation
    if (!routeOrigin || !routeDestination || !departureDateTime || !arrivalDateTime || !vehicleId || !driverId || fareToSubmit <= 0) {
        setError('Please fill in all fields and ensure a valid route is selected for fare calculation.');
        setLoading(false);
        return;
    }
     if (new Date(arrivalDateTime) <= new Date(departureDateTime)) {
        setError('Arrival time must be after departure time.');
        setLoading(false);
        return;
     }

    try {
      const newSchedule = await createSchedule(scheduleData, token);
      console.log('Schedule Created:', newSchedule);
      setSuccess('Schedule created successfully! Redirecting...');
      setLoading(false);

      setTimeout(() => {
        navigate('/admin/dashboard'); // Or '/admin/schedules' list page
      }, 2000);

    } catch (err) {
      console.error('Add Schedule Error:', err);
      setError(err.message || 'Failed to create schedule.');
      setLoading(false);
    }
  };

  // Get current date/time for min attribute on datetime inputs
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone
  const nowString = now.toISOString().slice(0, 16);

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 border rounded shadow-lg bg-white">
      <h1 className="text-3xl font-bold text-center mb-6">Create New Ride Schedule</h1>
      <form onSubmit={handleSubmit}>
        {error && ( <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span>{error}</span></div> )}
        {success && ( <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert"><span>{success}</span></div> )}

        {/* Route Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="routeOrigin">Origin City</label>
            <select id="routeOrigin" name="routeOrigin" value={routeOrigin} onChange={onChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white">
              <option value="">Select Origin</option>
              {UTTAR_PRADESH_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="routeDestination">Destination City</label>
            <select id="routeDestination" name="routeDestination" value={routeDestination} onChange={onChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white">
              <option value="">Select Destination</option>
              {UTTAR_PRADESH_CITIES.filter(city => city !== routeOrigin).map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        </div>

        {/* Date/Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
           <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="departureDateTime">Departure Date & Time</label>
            <input id="departureDateTime" name="departureDateTime" type="datetime-local" value={departureDateTime} onChange={onChange} min={nowString} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
          </div>
           <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="arrivalDateTime">Arrival Date & Time</label>
            <input id="arrivalDateTime" name="arrivalDateTime" type="datetime-local" value={arrivalDateTime} onChange={onChange} min={departureDateTime || nowString} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
          </div>
        </div>

        {/* Vehicle & Driver Assignment */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
           <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vehicleId">Assign Vehicle</label>
            <select id="vehicleId" name="vehicleId" value={vehicleId} onChange={onChange} required disabled={loadingDropdowns} className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white disabled:bg-gray-200">
              <option value="">{loadingDropdowns ? 'Loading...' : 'Select Vehicle'}</option>
              {vehicles.map(v => <option key={v._id} value={v._id}>{v.type} - {v.registrationNumber} (Cap: {v.capacity})</option>)}
            </select>
          </div>
           <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="driverId">Assign Driver</label>
            <select id="driverId" name="driverId" value={driverId} onChange={onChange} required disabled={loadingDropdowns} className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white disabled:bg-gray-200">
              <option value="">{loadingDropdowns ? 'Loading...' : 'Select Driver'}</option>
              {drivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.phone})</option>)}
            </select>
          </div>
        </div>

        {/* --- REMOVED Fare Per Seat Input --- */}
        {/* Display Calculated Fare */}
         <div className="mb-6">
             <label className="block text-gray-700 text-sm font-bold mb-2">Calculated Fare Per Seat</label>
             <p className="text-lg font-semibold p-2 border rounded bg-gray-100">
                 {calculatedFarePerSeat > 0 ? `₹${calculatedFarePerSeat.toFixed(2)}` : '(Select valid route)'}
             </p>
         </div>
        {/* --------------------------------- */}


        {/* Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            className={`bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={loading || loadingDropdowns || calculatedFarePerSeat <= 0} // Disable if fare is 0
          >
            {loading ? 'Creating...' : 'Create Schedule'}
          </button>
          <Link
             to="/admin/dashboard" // Link back to dashboard or future schedule list
             className="inline-block align-baseline font-bold text-sm text-gray-600 hover:text-gray-800"
           >
             Cancel
           </Link>
        </div>
      </form>
    </div>
  );
}

export default AddSchedulePage;
