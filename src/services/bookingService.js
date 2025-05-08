// src/services/bookingService.js (with Date Filter Params and Updated getMyBookings)

// Define your backend API base URL (can be shared or imported from a config)
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust port if needed

/**
 * Fetches bookings for the currently authenticated user.
 * Requires the auth token.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of booking objects.
 */
export const getMyBookings = async (token) => {
  if (!token) { throw new Error('Authentication token not found.'); }
  try {
    // *** Updated endpoint to /my-bookings ***
    const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });
    // Use error handling consistent with other functions in this file
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(response.statusText || `HTTP error! Status: ${response.status}`);
      }
      // Throw error with message from backend if available
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    // Assuming backend returns { success: true, data: bookingsArray }
    // Return the data array, or an empty array if data is missing
    return data.data || [];
  } catch (error) {
    console.error('Get My Bookings API call error (fetch):', error);
    // Re-throw the error for the component to handle
    // Ensure it's an Error object
    throw error instanceof Error ? error : new Error(error || 'Failed to fetch bookings.');
  }
};

/**
 * Creates a new booking.
 * Requires auth token.
 * @param {object} bookingData - Data for the new booking.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - The response data from the server (likely the created booking).
 */
export const createBooking = async (bookingData, token) => {
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
     // Assuming backend returns { success: true, data: createdBooking }
    return data.data; // Return the created booking object
  } catch (error) {
    console.error('Create Booking API call error (fetch):', error);
    throw error instanceof Error ? error : new Error(error || 'Failed to create booking.');
  }
};

/**
 * Cancels a booking for the authenticated user.
 * Requires auth token.
 * @param {string} bookingId - The ID of the booking to cancel.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - The response data from the server (likely the updated booking).
 */
export const cancelBooking = async (bookingId, token) => {
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  if (!bookingId) { throw new Error('Booking ID is required to cancel.'); }
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PUT', // Or PATCH, depending on backend implementation
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    // Assuming backend returns { success: true, data: updatedBooking }
    return data.data; // Return the updated booking object
  } catch (error) {
    console.error(`Cancel Booking (${bookingId}) API call error (fetch):`, error);
    throw error instanceof Error ? error : new Error(error || 'Failed to cancel booking.');
  }
};


/**
 * Fetches all bookings (for Admin). Supports pagination and filtering.
 * Requires admin auth token.
 * @param {string} token - The JWT authentication token (admin).
 * @param {number} [page=1] - The page number for pagination.
 * @param {number} [limit=15] - The number of bookings per page.
 * @param {object} [filters={}] - Optional filters (e.g., { status: 'Pending', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }).
 * @returns {Promise<object>} - A promise that resolves to an object containing { bookings: [], pagination: {}, count: number }.
 */
export const getAllAdminBookings = async (token, page = 1, limit = 15, filters = {}) => {
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }

  // --- Construct query parameters string ---
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  // Add filters to query params if they exist and have values
  if (filters.status) {
    params.append('status', filters.status);
  }
  if (filters.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params.append('endDate', filters.endDate);
  }
  // Add other potential filters
  // if (filters.userId) params.append('userId', filters.userId);
  // if (filters.vehicleId) params.append('vehicleId', filters.vehicleId);

  const queryString = params.toString();
  console.log("Fetching admin bookings with query:", queryString); // Log the query string

  try {
    // Ensure endpoint matches your backend admin route for fetching all bookings
    // Assuming it's /admin/bookings based on the function name
    const response = await fetch(`${API_BASE_URL}/admin/bookings?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    // Assuming backend returns { success: true, count: N, pagination: {...}, data: [bookings...] }
    return {
        bookings: data.data || [],
        pagination: data.pagination || {}, // Return pagination info from backend
        count: data.count || 0, // Total count matching filters
    };

  } catch (error) {
    console.error('Get All Admin Bookings API call error (fetch):', error);
    throw error instanceof Error ? error : new Error(error || 'Failed to fetch bookings.');
  }
};


/**
 * Assigns a vehicle and/or driver to a booking (for Admin).
 * Requires admin auth token.
 * @param {string} bookingId - The ID of the booking to update.
 * @param {object} assignmentData - Data containing vehicleId and/or driverId.
 * @param {string} token - The JWT authentication token (admin).
 * @returns {Promise<object>} - A promise that resolves to the updated booking object.
 */
export const assignToBooking = async (bookingId, assignmentData, token) => {
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  if (!bookingId) { throw new Error('Booking ID is required for assignment.'); }
  // Ensure assignmentData is an object and has at least one key we expect
  if (typeof assignmentData !== 'object' || assignmentData === null || (!assignmentData.vehicleId && !assignmentData.driverId)) {
       throw new Error('Valid assignment data (vehicleId or driverId) must be provided.');
   }
  try {
    // Assuming the admin endpoint is /admin/bookings/:id/assign
    const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/assign`, {
      method: 'PUT', // Or PATCH
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(assignmentData),
    });
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
     // Assuming backend returns { success: true, data: updatedBooking }
    return data.data; // Return the updated booking object
  } catch (error) {
    console.error(`Assign to Booking (${bookingId}) API call error (fetch):`, error);
    throw error instanceof Error ? error : new Error(error || 'Failed to assign vehicle/driver.');
  }
};
