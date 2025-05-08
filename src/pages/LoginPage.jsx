// src/pages/LoginPage.jsx (Example Structure)
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path
import { loginUser } from '../services/authService'; // Adjust path

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Call your login service function (email/password login)
            const response = await loginUser({ email, password });

            if (response.success) {
                // Call the login function from AuthContext to store token/user
                login(response.token, response.user);

                // *** Navigate based on role ***
                if (response.user?.role === 'admin') {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    // *** Navigate regular users to /new-booking ***
                    navigate('/new-booking', { replace: true });
                }
            } else {
                // Handle login failure (e.g., invalid credentials)
                setError(response.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            // Handle service/network errors
            console.error("Login Error:", err);
            setError(err.message || 'An error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-pink-50">
            <div className="p-8 bg-white rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-3xl font-bold text-center text-primary mb-6">Login</h2>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="********"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                     <div className="text-sm text-center mt-4">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-accent hover:text-accent-dark">
                                Sign up
                            </Link>
                             {' '}or login with{' '}
                             <Link to="/" className="font-medium text-accent hover:text-accent-dark">
                                OTP
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
