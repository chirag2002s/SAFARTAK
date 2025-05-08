// src/services/rideService.js

// Define your backend API base URL (or import from a shared config)
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust port if needed

/**
 * Fetches available rides based on search criteria.
 * Requires auth token.
 * @param {object} searchParams - Search parameters.
 * @param {string} searchParams.origin - Origin city name.
 * @param {string} searchParams.destination - Destination city name.
 * @param {string} searchParams.date - Travel date (e.g., 'YYYY-MM-DD').
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array>} - A promise that resolves to an array of available ride objects.
 */
export const getAvailableRides = async (searchParams, token) => {
  // Check for token and required search parameters
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  if (!searchParams || !searchParams.origin || !searchParams.destination || !searchParams.date) {
    throw new Error('Origin, destination, and date are required to find rides.');
  }

  // Construct query parameters string
  const params = new URLSearchParams({
    origin: searchParams.origin,
    destination: searchParams.destination,
    date: searchParams.date,
    // Add other potential filters later (e.g., time preference)
  });
  const queryString = params.toString();

  try {
    // Make GET request to the backend endpoint
    const response = await fetch(`${API_BASE_URL}/rides/available?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Send the token
        'Accept': 'application/json',
      },
    });

    // Check response status
    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();
    // Assuming backend returns { success: true, count: N, data: [rides...] }
    return data.data || []; // Return the rides array, default to empty array

  } catch (error) {
    // Log and re-throw errors
    console.error('Get Available Rides API call error (fetch):', error);
    throw error instanceof Error ? error : new Error(error || 'Failed to fetch available rides.');
  }
};
