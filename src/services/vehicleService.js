// src/services/vehicleService.js

// Define your backend API base URL (or import from a shared config)
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust port if needed

/**
 * Fetches all vehicles (for Admin).
 * Requires admin auth token.
 * @param {string} token - The JWT authentication token (admin).
 * @returns {Promise<Array>} - A promise that resolves to an array of vehicle objects.
 */
export const getAllVehicles = async (token) => {
  // Check if token is provided
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  try {
    // Make GET request to the vehicles endpoint
    // Ensure your GET /api/vehicles route is protected by admin middleware on the backend!
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Send the admin token
        'Accept': 'application/json',
      },
    });
    // Check if the response was successful
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }
    // Parse the JSON response
    const data = await response.json();
    // Return the array of vehicles, or an empty array if none exist
    return data.data || [];
  } catch (error) {
    // Log and re-throw errors
    console.error('Get All Vehicles API call error (fetch):', error);
    throw error instanceof Error ? error : new Error(error || 'Failed to fetch vehicles.');
  }
};

/**
 * Adds a new vehicle (for Admin).
 * Requires admin auth token.
 * @param {object} vehicleData - Data for the new vehicle.
 * @param {string} vehicleData.registrationNumber
 * @param {string} vehicleData.type
 * @param {number} vehicleData.capacity
 * @param {Array<string>} [vehicleData.features] - Optional array of feature strings.
 * @param {boolean} [vehicleData.isActive] - Optional, defaults likely handled by backend.
 * @param {string} token - The JWT authentication token (admin).
 * @returns {Promise<object>} - A promise that resolves to the newly created vehicle object.
 */
export const addVehicle = async (vehicleData, token) => {
  // Check for token
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  try {
    // Make POST request to the vehicles endpoint
    // Ensure your POST /api/vehicles route is protected by admin middleware on the backend!
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(vehicleData), // Send vehicle data in the body
    });
    // Check response status
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      // Handle specific backend errors (e.g., duplicate registration number)
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }
    // Parse and return the newly created vehicle data
    const data = await response.json();
    return data.data;
  } catch (error) {
    // Log and re-throw errors
    console.error('Add Vehicle API call error (fetch):', error);
    throw error instanceof Error ? error : new Error(error || 'Failed to add vehicle.');
  }
};

/**
 * Fetches a single vehicle by its ID (for Admin).
 * Requires admin auth token.
 * @param {string} vehicleId - The ID of the vehicle to fetch.
 * @param {string} token - The JWT authentication token (admin).
 * @returns {Promise<object>} - A promise that resolves to the vehicle object.
 */
export const getVehicleById = async (vehicleId, token) => {
  // Check for token and vehicleId
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  if (!vehicleId) { throw new Error('Vehicle ID is required.'); }

  try {
    // Make GET request to the specific vehicle endpoint
    // Ensure your GET /api/vehicles/:id route is protected by admin middleware on the backend!
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    // Check response status
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      // Handle specific errors like 'Vehicle not found' from backend
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }
    // Parse and return the vehicle data
    const data = await response.json();
    return data.data;
  } catch (error) {
    // Log and re-throw errors
    console.error(`Get Vehicle By ID (${vehicleId}) API call error (fetch):`, error);
    throw error instanceof Error ? error : new Error(error || 'Failed to fetch vehicle details.');
  }
};

/**
 * Updates an existing vehicle (for Admin).
 * Requires admin auth token.
 * @param {string} vehicleId - The ID of the vehicle to update.
 * @param {object} vehicleData - The updated data for the vehicle.
 * @param {string} [vehicleData.type] - Optional updated type.
 * @param {number} [vehicleData.capacity] - Optional updated capacity.
 * @param {Array<string>} [vehicleData.features] - Optional updated features array.
 * @param {boolean} [vehicleData.isActive] - Optional updated status.
 * @param {string} token - The JWT authentication token (admin).
 * @returns {Promise<object>} - A promise that resolves to the updated vehicle object.
 */
export const updateVehicle = async (vehicleId, vehicleData, token) => {
  // Check for token and vehicleId
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  if (!vehicleId) { throw new Error('Vehicle ID is required for update.'); }

  try {
    // Make PUT request to the specific vehicle endpoint
    // Ensure your PUT /api/vehicles/:id route is protected by admin middleware on the backend!
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(vehicleData), // Send updated fields in the body
    });
    // Check response status
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) { throw new Error(response.statusText || `HTTP error! Status: ${response.status}`); }
      // Handle specific backend errors (e.g., validation errors)
      throw new Error(errorData?.message || response.statusText || `HTTP error! Status: ${response.status}`);
    }
    // Parse and return the updated vehicle data
    const data = await response.json();
    return data.data;
  } catch (error) {
    // Log and re-throw errors
    console.error(`Update Vehicle (${vehicleId}) API call error (fetch):`, error);
    throw error instanceof Error ? error : new Error(error || 'Failed to update vehicle.');
  }
};

/**
 * Deletes a vehicle by its ID (for Admin).
 * Requires admin auth token.
 * @param {string} vehicleId - The ID of the vehicle to delete.
 * @param {string} token - The JWT authentication token (admin).
 * @returns {Promise<object>} - A promise that resolves to the response data (backend might return empty or success message).
 */
export const deleteVehicle = async (vehicleId, token) => {
  // Check for token and vehicleId
  if (!token) { throw new Error('Authentication token not found. Please log in.'); }
  if (!vehicleId) { throw new Error('Vehicle ID is required for deletion.'); }

  try {
    // Make DELETE request to the specific vehicle endpoint
    // Ensure your DELETE /api/vehicles/:id route is protected by admin middleware on the backend!
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
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
        return { success: true, message: 'Vehicle deleted successfully.' }; // Return standard success object for 204
    } else {
        // Try parsing if status is 200 (backend might send { success: true })
        try { const data = await response.json(); return data; } catch (e) { return { success: true, message: 'Vehicle deleted successfully.' }; }
    }
  } catch (error) {
    // Log and re-throw errors
    console.error(`Delete Vehicle (${vehicleId}) API call error (fetch):`, error);
    throw error instanceof Error ? error : new Error(error || 'Failed to delete vehicle.');
  }
};
