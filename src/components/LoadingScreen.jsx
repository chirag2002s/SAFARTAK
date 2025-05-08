// src/components/LoadingScreen.jsx
import React from 'react';

function LoadingScreen({ message = "Loading..." }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
            <p className="text-lg text-gray-600 font-medium">{message}</p>
            {/* Optional: Add Logo */}
            {/* <img src="/logo-dark.png" alt="Loading" className="w-24 mt-6 opacity-50"/> */}
        </div>
    );
}

export default LoadingScreen;
