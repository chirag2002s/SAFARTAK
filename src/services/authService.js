// src/services/authService.js

// *** Ensure API_BASE_URL is declared ONLY ONCE here ***
// Define your backend API base URL (Define only once)
// Ensure this matches your Render URL and includes /api if needed
const API_BASE_URL = 'https://safartak.onrender.com/api'; // Corrected typo and added /api based on previous context

/**
 * Helper function to handle fetch responses and errors consistently.
 * @param {Response} response - The fetch response object.
 * @returns {Promise<object>} - The parsed JSON data.
 * @throws {Error} - Throws an error if the response is not ok.
 */
const handleResponse = async (response) => {
  // Try to parse JSON regardless of status first, to get potential error messages
  let data;
  try {
      // Use .clone() because response body can only be read once
      data = await response.clone().json();
  } catch (jsonError) {
      // If JSON parsing fails, it might be non-JSON response (like HTML error page)
      console.error('[handleResponse] Failed to parse JSON response. Status:', response.status, response.statusText);
      // Throw a clearer error indicating it wasn't JSON
      throw new Error(`Server responded with status ${response.status} but the response was not valid JSON. Check the Network tab or server logs.`);
  }

  if (!response.ok) {
    // If the server response is not OK (e.g., 400, 401, 404, 500)
    console.error('[handleResponse] API Error Response:', data);
    // Throw an error with the message from the backend JSON, or fallback
    const error = new Error(data?.message || `HTTP error! Status: ${response.status}`);
    error.data = data || { success: false }; // Attach backend data if available
    throw error;
  }

  // If response is ok, return the parsed JSON data
  console.log('[handleResponse] API Success Response:', data);
  return data;
};

/**
 * Logs in a user using the fetch API.
 * @param {object} credentials - User credentials { email, password }.
 * @returns {Promise<object>} - The response data from the server (e.g., token, user info).
 */
export const loginUser = async (credentials) => {
  console.log('[authService] Attempting login for:', credentials.email);
  try {
    // Use the API_BASE_URL defined ONCE at the top
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('[authService] Login API call error:', error);
    throw error;
  }
};

/**
 * Registers a new user using the fetch API.
 * @param {object} userData - User registration data { name, email, phone, password, role? }.
 * @returns {Promise<object>} - The response data from the server.
 */
export const registerUser = async (userData) => {
  console.log('[authService] Attempting registration for:', userData.email || userData.phone);
  try {
    // Use the API_BASE_URL defined ONCE at the top
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('[authService] Register API call error:', error);
    throw error;
  }
};

/**
 * Logs in an admin user.
 * @param {object} credentials - Admin credentials { email, password }.
 * @returns {Promise<object>} - The response data from the server.
 */
export const adminLogin = async (credentials) => {
  console.log('[authService] Attempting admin login for:', credentials.email);
  try {
    // Use the API_BASE_URL defined ONCE at the top
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('[authService] Admin Login API call error:', error);
    throw error;
  }
};

/**
 * Fetches the current logged-in user's details using the token.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the user object.
 */
export const getMe = async (token) => {
  console.log('[authService] Fetching user details (getMe)');
  if (!token) { throw new Error('Authentication token not found.'); }
  try {
    // Use the API_BASE_URL defined ONCE at the top
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });
    const data = await handleResponse(response);
    if (data && data.success) {
        return data.data;
    } else {
        throw new Error(data?.message || 'Failed to fetch user details.');
    }
  } catch (error) {
    console.error('[authService] Get Me API call error:', error);
    throw error;
  }
};


/**
 * Requests an OTP for the given phone number using the fetch API.
 * @param {string} phone - The user's phone number.
 * @returns {Promise<object>} - Promise resolving with { success, message } on success.
 */
export const sendOtp = async (phone) => {
    console.log('[authService] Requesting OTP for phone:', phone);
    try {
        // Use the API_BASE_URL defined ONCE at the top
        const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
        });
        const data = await handleResponse(response);
        return data;
    } catch (error) {
        console.error('[authService] Send OTP API call error:', error);
        throw error;
    }
};


/**
 * Sends the phone number and OTP to the backend for verification using the fetch API.
 * @param {string} phone - The user's phone number.
 * @param {string} otp - The 6-digit OTP entered by the user.
 * @returns {Promise<object>} - Promise resolving with backend response.
 */
export const verifyOtp = async (phone, otp) => {
    console.log('[authService] Verifying OTP for phone:', phone);
    try {
        // Use the API_BASE_URL defined ONCE at the top
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp }),
        });
        const data = await handleResponse(response);
        return data;
    } catch (error) {
        console.error('[authService] Verify OTP API call error:', error);
        throw error;
    }
};

/**
 * Sends registration details along with the temporary registration token.
 * @param {string} registrationToken - The token received from verify-otp for new users.
 * @param {string} name - The user's full name.
 * @param {string} [email] - The user's email address (optional).
 * @returns {Promise<object>} - Promise resolving with { success, message, token, user } on successful registration and login.
 */
export const completeRegistration = async (registrationToken, name, email) => {
    console.log('[authService] Completing registration for name:', name);
    try {
        const payload = { registrationToken, name };
        if (email && email.trim() !== '') {
            payload.email = email.trim();
        }
        // Use the API_BASE_URL defined ONCE at the top
        const response = await fetch(`${API_BASE_URL}/auth/complete-registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await handleResponse(response);
        return data;
    } catch (error) {
        console.error('[authService] Complete Registration API call error:', error);
        throw error;
    }
};
