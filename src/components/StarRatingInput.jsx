// src/components/StarRatingInput.jsx
import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRatingInput = ({ rating, setRating, disabled = false, starSize = 24, starColor = "text-yellow-400", hoverColor = "text-yellow-500" }) => {
    const [hover, setHover] = useState(0); // To store the star value on hover

    return (
        <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button
                        type="button" // Important for forms, prevents default submit
                        key={starValue}
                        className={`focus:outline-none transition-colors duration-150 ease-in-out ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => !disabled && setRating(starValue)}
                        onMouseEnter={() => !disabled && setHover(starValue)}
                        onMouseLeave={() => !disabled && setHover(rating)} // Reset hover to current rating or 0 if none
                        disabled={disabled}
                        aria-label={`Rate ${starValue} out of 5 stars`}
                    >
                        <Star
                            size={starSize}
                            className={`
                                ${starValue <= (hover || rating) ? starColor : 'text-gray-300'}
                                ${!disabled && starValue <= hover ? hoverColor : ''}
                            `}
                            fill={starValue <= (hover || rating) ? 'currentColor' : 'none'}
                        />
                    </button>
                );
            })}
            {rating > 0 && !disabled && (
                 <button
                    type="button"
                    onClick={() => setRating(0)} // Allow clearing the rating
                    className="ml-2 text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
                    title="Clear rating"
                >
                    Clear
                </button>
            )}
        </div>
    );
};

export default StarRatingInput;
