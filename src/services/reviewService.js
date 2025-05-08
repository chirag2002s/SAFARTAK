// src/services/reviewService.js

// Define the base URL for your API.
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if needed

/**
 * Submits a new review to the backend.
 * @param {object} reviewData - The review data.
 * @param {string} token - The JWT token for authentication.
 * @returns {Promise<object>} The response data from the API.
 * @throws {Error} If the API request fails.
 */
export const submitReview = async (reviewData, token) => {
    console.log('[reviewService] Submitting review:', reviewData);
    const { bookingId, rating, comment } = reviewData;
    const bodyPayload = { bookingId, rating, comment: comment || '' };
    const targetUrl = `${API_BASE_URL}/reviews`;
    console.log(`[reviewService] Making POST request to: ${targetUrl}`);

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(bodyPayload),
        });
        let data;
        try { data = await response.json(); }
        catch (jsonError) {
            console.error('[reviewService] Failed to parse JSON response. Status:', response.status, response.statusText);
             throw new Error(`Server responded with status ${response.status} but the response was not valid JSON. Check the URL or server logs.`);
        }
        if (!response.ok) {
            console.error('[reviewService] API Error Response:', data);
            throw new Error(data?.message || `Error ${response.status}: Failed to submit review.`);
        }
        console.log('[reviewService] Review submitted successfully:', data);
        return data;
    } catch (error) {
        console.error('[reviewService] Network or other error submitting review:', error);
        throw error instanceof Error ? error : new Error(String(error) || 'Failed to submit review.');
    }
};


// --- *** NEW FUNCTION: Get Reviews for a Schedule *** ---

/**
 * Fetches reviews for a specific schedule.
 *
 * @param {string} scheduleId - The ID of the schedule to fetch reviews for.
 * @param {string} [token] - Optional JWT token (if endpoint requires auth).
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of review objects.
 * @throws {Error} If the API request fails.
 */
export const getReviewsForSchedule = async (scheduleId, token) => {
    console.log(`[reviewService] Fetching reviews for schedule ID: ${scheduleId}`);
    if (!scheduleId) {
        throw new Error('Schedule ID is required to fetch reviews.');
    }

    const targetUrl = `${API_BASE_URL}/reviews?schedule=${scheduleId}`;
    console.log(`[reviewService] Making GET request to: ${targetUrl}`);

    const headers = {
        'Accept': 'application/json',
    };
    // Add Authorization header only if the token is provided (if the endpoint needs it)
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: headers,
        });

        let data;
        try { data = await response.json(); }
        catch (jsonError) {
            console.error('[reviewService] Failed to parse JSON response. Status:', response.status, response.statusText);
             throw new Error(`Server responded with status ${response.status} but the response was not valid JSON. Check the URL or server logs.`);
        }

        if (!response.ok) {
            console.error('[reviewService] API Error Response:', data);
            throw new Error(data?.message || `Error ${response.status}: Failed to fetch reviews.`);
        }

        console.log(`[reviewService] Successfully fetched ${data.count || 0} reviews for schedule ${scheduleId}:`, data.data);
        // Return the array of reviews, defaulting to empty array if data is missing
        return data.data || [];

    } catch (error) {
        console.error(`[reviewService] Network or other error fetching reviews for schedule ${scheduleId}:`, error);
        throw error instanceof Error ? error : new Error(String(error) || 'Failed to fetch reviews.');
    }
};

// export const getUserReviews = async (userId, token) => { ... };
