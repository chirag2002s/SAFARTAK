// src/pages/CompleteRegistrationPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { completeRegistration } from '../services/authService'; // Import the new service
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

const CompleteRegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Get login function from context

  // Get data passed from VerifyOtpPage state
  const phone = location.state?.phone;
  const registrationToken = location.state?.registrationToken;

  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Optional email
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Effect to check if required state is present and login function exists
  useEffect(() => {
    let errorMsg = '';
    if (!phone || !registrationToken) {
      errorMsg = "Registration session details are missing. Please start the login process again.";
      console.error("Missing phone or registration token for completing registration.");
    } else if (typeof login !== 'function') {
        errorMsg = "Application setup error. Cannot complete registration.";
        console.error("Auth context login function is missing.");
    }

    if (errorMsg) {
        setError(errorMsg);
        // Optional: Redirect back to home/login after a delay
        // const timer = setTimeout(() => navigate('/'), 4000);
        // return () => clearTimeout(timer);
    }
  }, [phone, registrationToken, navigate, login]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Ensure critical data is present before attempting submission
    if (!registrationToken || !phone || typeof login !== 'function') {
        setError("Cannot complete registration due to missing session data or setup error.");
        return;
    }

    // Basic validation
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    // More robust email validation
    const emailTrimmed = email.trim();
    if (emailTrimmed && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailTrimmed)) {
        setError('Please enter a valid email address or leave it empty.');
        return;
    }

    setLoading(true);
    try {
      // Call the completeRegistration service
      // Pass undefined for email if it's empty after trimming
      const response = await completeRegistration(registrationToken, name.trim(), emailTrimmed || undefined);

      // No need to check response.success, handleResponse throws on error
      console.log("Registration completed successfully. Logging in...");
      login(response.token, response.user); // Log the user in

      // Redirect to dashboard
      navigate('/dashboard'); // Or based on role: response.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'

    } catch (err) {
      // Handle errors thrown by the service (handleResponse already parsed message)
       console.error("Error completing registration:", err);
      setError(err.message || 'An unexpected error occurred while completing registration.');
    } finally {
      setLoading(false);
    }
  };

  // Render error state if critical info is missing
   if (!phone || !registrationToken || typeof login !== 'function') {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">Registration Error</h2>
              {/* Display the specific error message set in useEffect */}
              <p className="text-gray-700 mb-6">{error || "Cannot load registration form due to missing information."}</p>
              <button
                onClick={() => navigate('/')} // Navigate to home or login page
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
          </div>
      );
  }


  return (
    // Using Tailwind CSS for styling
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Complete Your Registration</h2>
        <p className="text-center text-sm text-gray-600">
          Please provide your details for phone number <span className="font-medium">{phone}</span>.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Number (Read Only) */}
          <div>
            <label htmlFor="phone-display" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone-display"
              type="text"
              value={phone}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
            />
          </div>

          {/* Name Input (Required) */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email Input (Optional) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address (Optional)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          {error && <p className="text-sm text-center text-red-600">{error}</p>}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading || !name.trim()} // Disable if loading or name is empty
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Completing Registration...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteRegistrationPage;
