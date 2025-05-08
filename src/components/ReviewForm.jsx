// src/components/ReviewForm.jsx
import React, { useState } from 'react';
import StarRatingInput from './StarRatingInput'; // Assuming StarRatingInput.jsx is in the same components folder
import { useAuth } from '../contexts/AuthContext'; // To get the token
import { submitReview } from '../services/reviewService'; // *** IMPORT THE SERVICE FUNCTION ***

const ReviewForm = ({ bookingId, scheduleId, driverId, onReviewSubmitted, onCancel }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { token } = useAuth();
    // *** REMOVED MISPLACED AWAIT LINE FROM HERE ***

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }
        if (!bookingId) { // Backend primarily needs bookingId to derive other details
            setError('Booking information is missing. Cannot submit review.');
            console.error("ReviewForm: Missing bookingId", { bookingId });
            return;
        }
        if (!token) {
            setError('You must be logged in to submit a review.');
            return;
        }

        setIsLoading(true);

        // Prepare the data payload for the service
        const reviewDataPayload = {
            bookingId,
            scheduleId, // Pass along, service might use it or backend derives it
            driverId,   // Pass along, service might use it or backend derives it
            rating,
            comment,
        };

        try {
            // *** CALL THE ACTUAL SERVICE FUNCTION (Correctly placed inside async function) ***
            const response = await submitReview(reviewDataPayload, token);

            if (response.success) {
                setSuccessMessage(response.message || 'Thank you! Your review has been submitted.');
                setRating(0);
                setComment('');
                if (onReviewSubmitted) {
                    onReviewSubmitted(bookingId); // Notify parent
                }
                // Optionally close the form/modal after a delay
                setTimeout(() => {
                    if (onCancel) onCancel();
                }, 2500); // Increased delay for success message visibility
            } else {
                // This case might not be hit if submitReview throws an error for !response.ok
                setError(response.message || 'Failed to submit review. Please try again.');
            }
        } catch (err) {
            console.error("Error submitting review in ReviewForm:", err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-xl max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Write a Review</h3>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm break-words">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md text-sm">
                    {successMessage}
                </div>
            )}

            {!successMessage && ( // Hide form after successful submission
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Rating <span className="text-red-500">*</span>
                        </label>
                        <StarRatingInput rating={rating} setRating={setRating} disabled={isLoading} />
                    </div>

                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Comments (Optional)
                        </label>
                        <textarea
                            id="comment"
                            name="comment"
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-50"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your experience..."
                            maxLength="500"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">{comment.length}/500</p>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-2">
                        {onCancel && (
                             <button
                                type="button"
                                onClick={onCancel}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading || rating === 0} // Also disable if no rating is selected
                            className="px-6 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </span>
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ReviewForm;
