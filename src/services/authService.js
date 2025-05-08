// src/services/authService.js

// Define your backend API base URL (Define only once)
const API_BASE_URL = 'hhttps://safartak.onrender.com'; // Adjust port if needed

/**
 * Helper function to handle fetch responses and errors consistently.
 * @param {Response} response - The fetch response object.
 * @returns {Promise<object>} - The parsed JSON data.
 * @throws {Error} - Throws an error if the response is not ok.
 */// src/services/authService.js

// *** 1. Corrected the API_BASE_URL typo ***
// Define your backend API base URL (Define only once)
// Ensure this matches your Render URL and includes /api if needed
const API_BASE_URL = 'https://safartak.onrender.com/api'; // Corrected typo and added /api based on previous context

/**
 * Helper function to handle fetch responses and errors consistently.
 * @param {Response} response - The fetch response object.
 * @returns {Promise<object>} - The parsed JSON data.
 * @throws {Error} - Throws an error if the response is not ok.
 */
// *** 2. Defined handleResponse BEFORE it's used by exported functions ***
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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response); // Use the helper
    return data; // Expected: { success, message, token, user }
  } catch (error) {
    console.error('[authService] Login API call error:', error);
    throw error; // Re-throw for the component to handle
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
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(response); // Use the helper
    return data; // Expected: { success, message, token, user } (if auto-login) or { success, message, data: user }
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
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response); // Use the helper
    return data; // Expected: { success, message, token, user }
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
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });
    const data = await handleResponse(response); // Use the helper
    // Backend returns { success: true, data: user }
    if (data && data.success) {
        return data.data; // Return just the user object
    } else {
        // This case might occur if backend sends success: false with 200 OK (unlikely with handleResponse)
        throw new Error(data?.message || 'Failed to fetch user details.');
    }
  } catch (error) {
    console.error('[authService] Get Me API call error:', error);
    throw error; // Let AuthContext handle auth errors (like 401)
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
        const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
        });
        const data = await handleResponse(response); // Use the helper
        return data; // Expected: { success: true, message: '...' }
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
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp }),
        });
        const data = await handleResponse(response); // Use the helper
        return data; // Return the full data object from backend
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
        const response = await fetch(`${API_BASE_URL}/auth/complete-registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await handleResponse(response); // Use the helper
        return data; // Expected: { success, message, token, user }
    } catch (error) {
        console.error('[authService] Complete Registration API call error:', error);
        throw error;
    }
};

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
