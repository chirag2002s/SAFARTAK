// src/services/authService.js

// Define your backend API base URL (Define only once)
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust port if needed

/**
 * Helper function to handle fetch responses and errors consistently.
 * @param {Response} response - The fetch response object.
 * @returns {Promise<object>} - The parsed JSON data.
 * @throws {Error} - Throws an error if the response is not ok.
 */
// *** Added 'export' keyword here ***
export const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      // Try to parse the error response from the backend
      errorData = await response.json();
    } catch (parseError) {
      // If parsing fails, use the status text or a generic HTTP error
      throw new Error(response.statusText || `HTTP error! Status: ${response.status}`);
    }
    // Throw an error with the message from the backend, or fallback to status text/HTTP error
    // Include success: false in the thrown error object if possible
    const error = new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    error.data = errorData || { success: false }; // Attach backend data if available
    throw error;
  }
  // If response is ok, parse and return the JSON data
  return response.json();
};

/**
 * Logs in a user using the fetch API.
 * @param {object} credentials - User credentials.
 * @returns {Promise<object>} - The response data from the server (e.g., token, user info).
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    // Use the helper to handle response and errors
    const data = await handleResponse(response);
    return data; // { success, message, token, user }
  } catch (error) {
    console.error('Login API call error (fetch):', error);
    // Re-throw the specific error caught or a generic one
    throw error; // Let the calling component handle the error object
  }
};

/**
 * Registers a new user using the fetch API.
 * @param {object} userData - User registration data.
 * @returns {Promise<object>} - The response data from the server.
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    // Use the helper to handle response and errors
    const data = await handleResponse(response);
    return data; // { success, message, data: user }
  } catch (error) {
    console.error('Register API call error (fetch):', error);
    // Re-throw the specific error caught or a generic one
    throw error;
  }
};

/**
 * Logs in an admin user.
 * @param {object} credentials - Admin credentials.
 * @returns {Promise<object>} - The response data from the server.
 */
export const adminLogin = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    // Use the helper to handle response and errors
    const data = await handleResponse(response);
    return data; // { success, message, token, user }
  } catch (error) {
    console.error('Admin Login API call error (fetch):', error);
    // Re-throw the specific error caught or a generic one
    throw error;
  }
};

/**
 * Fetches the current logged-in user's details using the token.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the user object.
 */
export const getMe = async (token) => {
  if (!token) { throw new Error('Authentication token not found.'); }
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });
    // Use the helper to handle response and errors
    const data = await handleResponse(response);
    // Assuming backend returns { success: true, data: user }
    if (data && data.success) {
        return data.data; // Return the user object
    } else {
        // Handle cases where backend might return success: false even with 2xx status
        throw new Error(data?.message || 'Failed to fetch user details.');
    }
  } catch (error) {
    // Log and re-throw errors
    console.error('Get Me API call error (fetch):', error);
    // Don't throw generic message, let specific error (like 401) propagate
    throw error;
  }
};


/**
 * Requests an OTP for the given phone number using the fetch API.
 * @param {string} phone - The user's phone number.
 * @returns {Promise<object>} - Promise resolving with { success, message } on success.
 */
export const sendOtp = async (phone) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
        });
        // Use the helper to handle response and errors
        const data = await handleResponse(response);
        // Backend should return { success: true, message: '...' }
        return data;
    } catch (error) {
        console.error('Send OTP API call error (fetch):', error);
        // Re-throw the specific error caught or a generic one
        throw error;
    }
};


/**
 * Sends the phone number and OTP to the backend for verification using the fetch API.
 * @param {string} phone - The user's phone number.
 * @param {string} otp - The 6-digit OTP entered by the user.
 * @returns {Promise<object>} - Promise resolving with backend response.
 * Possible success responses:
 * 1. { success: true, loggedIn: true, message, token, user } - Existing user logged in.
 * 2. { success: true, loggedIn: false, needsDetails: true, phone, registrationToken } - New user needs details.
 */
export const verifyOtp = async (phone, otp) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp }),
        });
        // Use handleResponse which checks response.ok and parses JSON
        const data = await handleResponse(response);
        // Return the full data object from the backend
        return data;
    } catch (error) {
        console.error('Verify OTP API call error (fetch):', error);
        // Re-throw the specific error caught
        throw error;
    }
};

// --- Complete Registration function ---
/**
 * Sends registration details along with the temporary registration token.
 * @param {string} registrationToken - The token received from verify-otp for new users.
 * @param {string} name - The user's full name.
 * @param {string} [email] - The user's email address (optional).
 * @returns {Promise<object>} - Promise resolving with { success, message, token, user } on successful registration and login.
 */
export const completeRegistration = async (registrationToken, name, email) => {
    try {
        const payload = { registrationToken, name };
        // Only include email in payload if it's provided and not empty/whitespace
        if (email && email.trim() !== '') {
            payload.email = email.trim();
        }
        const response = await fetch(`${API_BASE_URL}/auth/complete-registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        // Use handleResponse which checks response.ok and parses JSON
        const data = await handleResponse(response);
        // Backend should return { success: true, message, token, user } on success
        return data;
    } catch (error) {
        console.error('Complete Registration API call error (fetch):', error);
        // Re-throw the specific error caught
        throw error;
    }
};
