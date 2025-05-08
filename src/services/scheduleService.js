// src/services/scheduleService.js
import { handleResponse } from './authService'; // Assuming handleResponse is exported from authService or a shared helper
// Removed mongoose import - it's a backend library

// Define your backend API base URL
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if needed

/**
 * Finds available schedules based on search criteria.
 * Requires authentication token.
 * @param {object} searchParams - Search parameters.
 * @param {string} searchParams.origin - Origin city/location.
 * @param {string} searchParams.destination - Destination city/location.
 * @param {string} searchParams.date - Travel date in 'YYYY-MM-DD' format.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of schedule objects.
 */
// *** Ensure 'export const' is present here ***
export const findSchedules = async (searchParams, token) => {
  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }
  if (!searchParams || !searchParams.origin || !searchParams.destination || !searchParams.date) {
      throw new Error('Origin, destination, and date are required to find schedules.');
  }

  // Construct query parameters string from searchParams object
  const query = new URLSearchParams({
    origin: searchParams.origin,
    destination: searchParams.destination,
    date: searchParams.date,
  }).toString();

  const finalURL = `${API_BASE_URL}/schedules/search?${query}`; // Construct final URL

  // *** ADD THIS LOG ***
  console.log(`[scheduleService] Making fetch request to: ${finalURL}`);
  // ********************


  try {
    // Ensure your backend route is GET /api/schedules/search
    const response = await fetch(finalURL, { // Use the finalURL variable
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Send the token for authentication
        'Accept': 'application/json',
      },
    });

    // Use the shared helper to handle response and errors
    const data = await handleResponse(response);

    // Assumes backend returns { success: true, data: schedulesArray } on success
    if (data && data.success) {
        // Return the array of schedules, default to empty array if data is missing
        return data.data || [];
    } else {
        // Handle cases where backend might return success: false even with 2xx status
        throw new Error(data?.message || 'Failed to find schedules.');
    }
  } catch (error) {
    // Log and re-throw errors for the component to handle
    console.error('Find Schedules API call error (fetch):', error);
    // Re-throw the original error object
    throw error;
  }
};

/**
 * Creates a new ride schedule (for Admin).
 * Requires admin auth token.
 * @param {object} scheduleData - Data for the new schedule.
 * @param {string} token - The JWT authentication token (admin).
 * @returns {Promise<object>} - A promise that resolves to the newly created schedule object.
 */
export const createSchedule = async (scheduleData, token) => {
  // Check for token
  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }
  // Basic check for required fields
  if (!scheduleData.routeOrigin || !scheduleData.routeDestination || !scheduleData.departureDateTime || !scheduleData.arrivalDateTime || !scheduleData.vehicleId || !scheduleData.driverId || scheduleData.farePerSeat === undefined) {
      throw new Error('Missing required schedule details.');
  }

  try {
    // Ensure backend route is POST /api/schedules
    const response = await fetch(`${API_BASE_URL}/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(scheduleData),
    });

    const data = await handleResponse(response);

    // Assuming backend returns { success: true, data: newSchedule }
    if (data && data.success) {
        return data.data;
    } else {
        throw new Error(data?.message || 'Failed to create schedule.');
    }

  } catch (error) {
    console.error('Create Schedule API call error (fetch):', error);
    throw error;
  }
};


// *** NEW: Function to get seat layout for a schedule ***
/**
 * Fetches the seat layout and availability for a specific schedule.
 * Requires authentication token.
 * @param {string} scheduleId - The ID of the schedule.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of seat layout objects.
 */
export const getSeatLayout = async (scheduleId, token) => {
    if (!token) {
        throw new Error('Authentication token not found. Please log in.');
    }
    // Basic validation for scheduleId format using Regex
     const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
     if (!scheduleId || !isValidObjectId(scheduleId)) {
        // Throw an error if the ID format is incorrect before making the API call
        throw new Error('Invalid Schedule ID format provided for fetching seat layout.');
    }

    console.log(`Fetching seat layout for schedule ID: ${scheduleId}`);

    try {
        // Ensure backend route is GET /api/schedules/:scheduleId/seats
        const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}/seats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        const data = await handleResponse(response);

        // Assuming backend returns { success: true, data: seatLayoutArray }
        if (data && data.success) {
            return data.data || []; // Return the seat layout array
        } else {
            throw new Error(data?.message || 'Failed to fetch seat layout.');
        }
    } catch (error) {
        console.error(`Get Seat Layout API call error for schedule ${scheduleId}:`, error);
        throw error; // Re-throw for the component to handle
    }
};
// *** End of getSeatLayout function ***


// Add other schedule-related service functions here if needed
