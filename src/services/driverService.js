// src/services/driverService.js

// Define your backend API base URL (or import from a shared config)
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust port if needed

/**
 * Fetches all drivers (for Admin).
 * Requires admin auth token.
 * @param {string} token - The JWT authentication token (admin).
 * @returns {Promise<Array>} - A promise that resolves to an array of driver objects.
 */
export const getAllDrivers = async (token) => {
  // Check if token is provided
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  try {
    // Make GET request to the drivers endpoint
    const response = await fetch(`${API_BASE_URL}/drivers`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });
    // Check response status
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }
    // Parse and return driver data
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    // Log and re-throw errors
    console.error('Get All Drivers API call error (fetch):', error);
    throw error instanceof Error ? error : new Error(error || 'Failed to fetch drivers.');
  }
};


/**
 * Adds a new driver (for Admin).
 * Requires admin auth token.
 * @param {object} driverData - Data for the new driver.
 * @param {string} driverData.name
 * @param {string} driverData.phone
 * @param {string} driverData.licenseNumber
 * @param {string} token - The JWT authentication token (admin).
 * @returns {Promise<object>} - A promise that resolves to the newly created driver object.
 */
export const addDriver = async (driverData, token) => {
  // Check for token
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  try {
    // Make POST request to the base drivers endpoint
    const response = await fetch(`${API_BASE_URL}/drivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(driverData), // Send driver data in the body
    });
    // Check response status
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      // Handle specific backend errors (e.g., duplicate phone/license)
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }
    // Parse and return the newly created driver data
    const data = await response.json();
    return data.data;
  } catch (error) {
    // Log and re-throw errors
    console.error('Add Driver API call error (fetch):', error);
    throw error instanceof Error ? error : new Error(error || 'Failed to add driver.');
  }
};


/**
 * Fetches a single driver by their ID (for Admin).
 * Requires admin auth token.
 * @param {string} driverId - The ID of the driver to fetch.
 * @param {string} token - The JWT authentication token (admin).
 * @returns {Promise<object>} - A promise that resolves to the driver object.
 */
export const getDriverById = async (driverId, token) => {
  // Check for token and driverId
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  if (!driverId) { throw new Error('Driver ID is required.'); }

  try {
    // Make GET request to the specific driver endpoint (e.g., /api/drivers/:id)
    // Ensure your GET /api/drivers/:id route is protected by admin middleware on the backend!
    const response = await fetch(`${API_BASE_URL}/drivers/${driverId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    // Check response status
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      // Handle specific errors like 'Driver not found' from backend
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }
    // Parse and return the driver data
    const data = await response.json();
    // Assuming backend returns { success: true, data: driver }
    return data.data;
  } catch (error) {
    // Log and re-throw errors
    console.error(`Get Driver By ID (${driverId}) API call error (fetch):`, error);
    throw error instanceof Error ? error : new Error(error || 'Failed to fetch driver details.');
  }
};


/**
 * Updates an existing driver (for Admin).
 * Requires admin auth token.
 * @param {string} driverId - The ID of the driver to update.
 * @param {object} driverData - The updated data for the driver (e.g., name, phone, assignedVehicle).
 * @param {string} token - The JWT authentication token (admin).
 * @returns {Promise<object>} - A promise that resolves to the updated driver object.
 */
export const updateDriver = async (driverId, driverData, token) => {
  // Check for token and driverId
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  if (!driverId) { throw new Error('Driver ID is required for update.'); }

  try {
    // Make PUT request to the specific driver endpoint (e.g., /api/drivers/:id)
    // Ensure your PUT /api/drivers/:id route is protected by admin middleware on the backend!
    const response = await fetch(`${API_BASE_URL}/drivers/${driverId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(driverData), // Send fields to be updated
    });
    // Check response status
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      // Handle specific backend errors (e.g., validation, duplicate phone)
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }
    // Parse and return the updated driver data
    const data = await response.json();
    // Assuming backend returns { success: true, data: updatedDriver }
    return data.data;
  } catch (error) {
    // Log and re-throw errors
    console.error(`Update Driver (${driverId}) API call error (fetch):`, error);
    throw error instanceof Error ? error : new Error(error || 'Failed to update driver.');
  }
};


/**
 * Deletes a driver by their ID (for Admin).
 * Requires admin auth token.
 * @param {string} driverId - The ID of the driver to delete.
 * @param {string} token - The JWT authentication token (admin).
 * @returns {Promise<object>} - A promise that resolves to the response data (backend might return empty or success message).
 */
export const deleteDriver = async (driverId, token) => {
  // Check for token and driverId
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  if (!driverId) { throw new Error('Driver ID is required for deletion.'); }

  try {
    // Make DELETE request to the specific driver endpoint (e.g., /api/drivers/:id)
    // Ensure your DELETE /api/drivers/:id route is protected by admin middleware on the backend!
    const response = await fetch(`${API_BASE_URL}/drivers/${driverId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    // Check response status
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }
    // Handle successful deletion (status 200 or 204)
    if (response.status === 204) {
        return { success: true, message: 'Driver deleted successfully.' }; // Return standard success object for 204
    } else {
        // Try parsing if status is 200 (backend might send { success: true })
        try { const data = await response.json(); return data; } catch (e) { return { success: true, message: 'Driver deleted successfully.' }; }
    }
  } catch (error) {
    // Log and re-throw errors
    console.error(`Delete Driver (${driverId}) API call error (fetch):`, error);
    throw error instanceof Error ? error : new Error(error || 'Failed to delete driver.');
  }
};
