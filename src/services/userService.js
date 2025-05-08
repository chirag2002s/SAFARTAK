// src/services/userService.js

// Define the base URL for your API. Match this with your other service files.
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust port and base path (e.g., /api/v1) if needed

/**
 * Updates the details for the currently authenticated user.
 *
 * @param {object} detailsData - Object containing the details to update.
 * @param {string} [detailsData.name] - The new name.
 * @param {string} [detailsData.email] - The new email.
 * @param {string} [detailsData.phone] - The new phone number.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the updated user object from the API.
 * @throws {Error} If the API request fails or returns an error.
 */
export const updateUserDetails = async (detailsData, token) => {
    console.log('[userService] Updating user details:', detailsData);
    if (!token) { throw new Error('Authentication token not found.'); }
    if (!detailsData || Object.keys(detailsData).length === 0) {
        throw new Error('No details provided for update.');
    }

    const targetUrl = `${API_BASE_URL}/auth/updatedetails`; // Matches backend route
    console.log(`[userService] Making PUT request to: ${targetUrl}`);

    try {
        const response = await fetch(targetUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(detailsData),
        });

        let data;
        try { data = await response.json(); }
        catch (jsonError) {
            console.error('[userService] Failed to parse JSON response (updateDetails). Status:', response.status, response.statusText);
             throw new Error(`Server responded with status ${response.status} but the response was not valid JSON.`);
        }

        if (!response.ok) {
            console.error('[userService] API Error Response (updateDetails):', data);
            throw new Error(data?.message || `Error ${response.status}: Failed to update details.`);
        }

        console.log('[userService] User details updated successfully:', data);
        // Assuming backend returns { success: true, data: updatedUser }
        return data.data; // Return the updated user object

    } catch (error) {
        console.error('[userService] Network or other error updating details:', error);
        throw error instanceof Error ? error : new Error(String(error) || 'Failed to update details.');
    }
};


/**
 * Updates the password for the currently authenticated user.
 *
 * @param {object} passwordData - Object containing password information.
 * @param {string} passwordData.currentPassword - The user's current password.
 * @param {string} passwordData.newPassword - The desired new password.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the success response object from the API.
 * @throws {Error} If the API request fails or returns an error.
 */
export const updateUserPassword = async (passwordData, token) => {
    console.log('[userService] Updating user password...'); // Don't log passwords
    if (!token) { throw new Error('Authentication token not found.'); }
    if (!passwordData || !passwordData.currentPassword || !passwordData.newPassword) {
        throw new Error('Current and new passwords are required.');
    }

    const targetUrl = `${API_BASE_URL}/auth/updatepassword`; // Matches backend route
    console.log(`[userService] Making PUT request to: ${targetUrl}`);

    try {
        const response = await fetch(targetUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            }),
        });

        let data;
        try { data = await response.json(); }
        catch (jsonError) {
            console.error('[userService] Failed to parse JSON response (updatePassword). Status:', response.status, response.statusText);
             throw new Error(`Server responded with status ${response.status} but the response was not valid JSON.`);
        }

        if (!response.ok) {
            console.error('[userService] API Error Response (updatePassword):', data);
            throw new Error(data?.message || `Error ${response.status}: Failed to update password.`);
        }

        console.log('[userService] User password updated successfully:', data);
        // Assuming backend returns { success: true, message: '...' }
        return data; // Return the success response object

    } catch (error) {
        console.error('[userService] Network or other error updating password:', error);
        throw error instanceof Error ? error : new Error(String(error) || 'Failed to update password.');
    }
};
