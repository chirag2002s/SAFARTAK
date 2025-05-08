// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService'; // Import the register function

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // To show success message
  const [loading, setLoading] = useState(false);

  const { name, email, phone, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear errors on input change
    setSuccess(''); // Clear success message on input change
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return; // Stop submission
    }
    if (password.length < 6) { // Example: Enforce minimum password length
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    // Add other validations as needed (e.g., email format, phone format)

    try {
      // Prepare data for API (exclude confirmPassword)
      const userData = { name, email, phone, password };
      const data = await registerUser(userData);

      console.log('Registration Successful:', data);
      setSuccess('Registration successful! Redirecting to login...'); // Set success message
      setLoading(false);

      // Clear form (optional)
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Redirect after 2 seconds

    } catch (err) {
      console.error('Registration Failed:', err.message);
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border rounded shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Create Safartak Account</h1>

      <form onSubmit={onSubmit}>
        {error && ( <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span>{error}</span></div> )}
        {success && ( <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert"><span>{success}</span></div> )}

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Name</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Your Full Name" name="name" value={name} onChange={onChange} required />
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="your.email@example.com" name="email" value={email} onChange={onChange} required />
        </div>

        {/* Phone Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">Phone Number</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="phone" type="tel" placeholder="e.g., 9xxxxxxxxx" name="phone" value={phone} onChange={onChange} required />
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************" name="password" value={password} onChange={onChange} required />
        </div>

        {/* Confirm Password Input */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="confirmPassword" type="password" placeholder="******************" name="confirmPassword" value={confirmPassword} onChange={onChange} required />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button className={`bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignupPage;