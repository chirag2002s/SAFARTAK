// src/services/paymentService.js

// Define your backend API base URL (or import from a shared config)
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust port if needed

/**
 * Calls the backend to create a Razorpay order for a specific booking.
 * Requires auth token.
 * @param {string} bookingId - The ID of the booking to pay for.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the order details from the backend
 * (e.g., { success: true, order: { id, amount, currency }, razorpayKeyId: '...' }).
 */
export const createRazorpayOrder = async (bookingId, token) => {
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  if (!bookingId) { throw new Error('Booking ID is required to create payment order.'); }

  try {
    // POST request to the backend endpoint to create the order
    const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Send token for authentication
      },
      body: JSON.stringify({ bookingId }), // Send the booking ID in the request body
    });

    // Check if the backend responded successfully
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }

    // Parse the successful JSON response from the backend
    const data = await response.json();

    // Validate the structure of the response data
    if (!data.success || !data.order || !data.razorpayKeyId) {
        console.error("Invalid response structure from create-order API:", data);
        throw new Error('Invalid response received from create order API.');
    }

    // Return the full response object containing order details and Razorpay Key ID
    return data;

  } catch (error) {
    // Log and re-throw any errors encountered during the fetch process
    console.error(`Create Razorpay Order API call error (fetch):`, error);
    throw error instanceof Error ? error : new Error(error || 'Failed to create payment order.');
  }
};

// --- NEW: verifyPayment function ---
/**
 * Sends payment verification details to the backend.
 * Requires auth token.
 * @param {object} verificationData - Data received from Razorpay success handler plus bookingId.
 * @param {string} verificationData.razorpay_order_id
 * @param {string} verificationData.razorpay_payment_id
 * @param {string} verificationData.razorpay_signature
 * @param {string} verificationData.bookingId - The ID of the booking this payment is for.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise resolving to the backend verification response (likely including updated booking).
 */
export const verifyPayment = async (verificationData, token) => {
  // Check for token and necessary verification data
  if (!token) { throw new Error('Authentication token not found.'); }
  if (!verificationData || !verificationData.razorpay_payment_id || !verificationData.razorpay_order_id || !verificationData.razorpay_signature || !verificationData.bookingId) {
    throw new Error('Missing required payment verification data.');
  }

  try {
    // Make POST request to the backend verification endpoint
    const response = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(verificationData), // Send all verification details
    });

    // Check if the backend responded successfully
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      // Handle specific errors like 'Signature verification failed' or 'Booking update failed'
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }

    // Parse the successful JSON response
    const data = await response.json();
    // Assuming backend returns { success: true, message: '...', booking: updatedBooking }
    if (!data.success || !data.booking) {
        console.error("Invalid response structure from verify API:", data);
        throw new Error('Payment verified but failed to get updated booking details.');
    }
    return data; // Return the full response object

  } catch (error) {
    // Log and re-throw errors
    console.error('Verify Payment API call error (fetch):', error);
    throw error instanceof Error ? error : new Error(error || 'Failed to verify payment.');
  }
};
