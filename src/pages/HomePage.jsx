// src/pages/HomePage.jsx (with Custom Image and OTP Logic)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Import the service function to send OTP
import { sendOtp } from '../services/authService';
// import { useTranslation } from 'react-i18next'; // Keep if other text needs translation
// import { useAuth } from '../contexts/AuthContext'; // Import if needed for redirection

// --- REMOVED ShuttleIcon SVG component ---

function HomePage() {
  // const { t } = useTranslation(); // Keep if needed for other text
  const navigate = useNavigate();
  // const { isAuthenticated } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Optional redirect logic remains commented out
  // useEffect(() => { ... });

  const handlePhoneChange = (e) => {
    // Allow only digits and limit to 10
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhoneNumber(value);
      setError(''); // Clear error on valid input change
    }
  };

  // Updated function to handle sending OTP
  const handleContinue = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true); // Set loading state
    console.log('Requesting OTP for phone:', phoneNumber);

    try {
      // Call the sendOtp service function from authService.js
      const data = await sendOtp(phoneNumber);

      if (data.success) {
        // --- Navigate to VerifyOtpPage on successful OTP request ---
        console.log('OTP sent successfully, navigating to verification.');
        // Pass the phone number via route state to the verification page
        navigate('/verify-otp', { state: { phone: phoneNumber } });
        // -----------------------------------------------------------
      } else {
        // Handle cases where the API returns success: false (though handleResponse should catch errors)
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      // Catch errors thrown by the authService (network, server errors)
      console.error('Error sending OTP:', err);
      setError(err.message || 'An error occurred while sending the OTP. Please check your connection and try again.');
    } finally {
      setLoading(false); // Reset loading state regardless of outcome
    }
  };

  return (
    // Main container - No longer needs min-height calculation relative to Navbar/Footer
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 sm:py-12 bg-gradient-to-b from-white to-pink-50"> {/* Optional background gradient */}

      {/* Content Box */}
      <div className="w-full max-w-md text-center">

        {/* Logo/Title */}
        <h1 className="text-5xl sm:text-6xl font-bold mb-2">
          <span className="text-primary">Safar</span>{/* Black part */}
          <span className="text-accent">tak</span>{/* Pink part */}
        </h1>
        {/* Tagline */}
        <p className="text-lg sm:text-xl text-gray-600 mb-8">
          Smart Shuttle, Smarter Travel {/* TODO: Add translation key */}
        </p>

        {/* --- Replaced SVG with Image Tag --- */}
        <div className="mb-6 px-4"> {/* Added padding */}
          <img
            src="/hulu.png" // Path relative to the public folder
            alt="Safartak Shuttle Vehicle"
            className="w-full h-auto max-w-xs sm:max-w-sm mx-auto object-contain" // Adjusted max-width
            onError={(e) => { e.target.style.display='none'; console.error("Failed to load image"); /* Optional: show placeholder */ }}
          />
        </div>
        {/* ---------------------------------- */}

        {/* Phone Login Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Enter your phone number {/* TODO: Add translation key */}
          </h2>

          <form onSubmit={handleContinue}>
            {/* Display error message if any */}
            {error && ( <p className="text-red-500 text-sm mb-3">{error}</p> )}
            <div className="mb-4">
              <input
                type="tel" // Use tel for semantic meaning and potential mobile keyboard optimization
                inputMode="numeric" // Hint for numeric keyboard
                name="phoneNumber"
                id="phoneNumber"
                placeholder="Enter your phone number" // TODO: Add translation key
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-center text-lg"
                required
                maxLength={10} // Keep max length
                disabled={loading} // Disable input while loading
              />
            </div>
            <button
              type="submit"
              // Disable button if loading or phone number is not 10 digits
              disabled={loading || phoneNumber.length !== 10}
              className={`w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-200 ease-in-out ${ loading || phoneNumber.length !== 10 ? 'opacity-50 cursor-not-allowed' : '' }`}
            >
              {/* Change button text based on loading state */}
              {loading ? 'Sending OTP...' : 'Continue'} {/* TODO: Add translation keys */}
            </button>
          </form>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 mt-4 px-4">
            By continuing, you agree to Safartak's Terms of Use and Privacy Policy. {/* TODO: Add translation key */}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
