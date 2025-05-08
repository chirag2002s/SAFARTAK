// src/pages/AdminLoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/authService'; // Import the admin login function
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to use the login function

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth(); // Get login function and auth state

  const [formData, setFormData] = useState({
    email: '', // Admin usually logs in with email
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  // Redirect if already logged in as admin (or handle based on role)
  useEffect(() => {
    // Basic redirect if logged in - enhance later with role check
    if (isAuthenticated && user?.role === 'admin') {
       console.log("Already logged in as admin, redirecting...");
       navigate('/admin/dashboard'); // Redirect to admin dashboard
    }
  }, [isAuthenticated, user, navigate]);


  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await adminLogin({ email, password });
      console.log('Admin Login Successful:', data);

      // Use the same login function from AuthContext
      // It will store the token and user data (which should include role)
      login(data.token, data.user);

      // Redirect to an admin-specific dashboard
      navigate('/admin/dashboard'); // We'll create this page and route later

    } catch (err) {
      console.error('Admin Login Failed:', err.message);
      setError(err.message || 'Admin login failed. Please check credentials.');
      setLoading(false);
    }
    // setLoading(false); // Not needed if navigating away
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border rounded shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-accent">Admin Login</h1> {/* Added theme color */}

      <form onSubmit={onSubmit}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Admin Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email" // Use email type
            placeholder="admin@example.com"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="******************"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            className={`bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Admin Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminLoginPage;