// src/pages/VerifyOtpPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOtp, sendOtp } from '../services/authService'; // Ensure path is correct
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CheckCircle } from 'lucide-react'; // Import icons
import { motion } from 'framer-motion'; // For animations

function VerifyOtpPage() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false); // For API call loading
    const [verifying, setVerifying] = useState(false); // For state after successful verification but before navigation
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const phone = location.state?.phone;
    const otpInputRef = useRef(null);

    // Effect for timer and initial checks
    useEffect(() => {
        if (!phone) {
            setError('Verification details missing. Redirecting...');
            const timer = setTimeout(() => navigate('/', { replace: true }), 2000); // Redirect to phone entry
            return () => clearTimeout(timer);
        }
        if (typeof login !== 'function') {
            console.error("AuthContext does not provide a login function!");
            setError("Authentication system error.");
            return;
        }
        otpInputRef.current?.focus();

        // Resend Timer Logic
        let interval;
        if (resendTimer > 0) {
            setCanResend(false);
            interval = setInterval(() => {
                setResendTimer((prevTimer) => {
                    if (prevTimer <= 1) { clearInterval(interval); setCanResend(true); return 0; }
                    return prevTimer - 1;
                });
            }, 1000);
        } else { setCanResend(true); }
        return () => clearInterval(interval);
    }, [resendTimer, phone, navigate, login]);


    const handleOtpChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 6) {
            setOtp(value);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!phone || typeof login !== 'function') { setError('Cannot verify OTP due to missing details or setup error.'); return; }
        if (otp.length !== 6) { setError('Please enter a valid 6-digit OTP.'); return; }

        setLoading(true);
        try {
            const response = await verifyOtp(phone, otp);
            console.log("Response from verifyOtp:", response);

            // --- Show Verifying Indicator ---
            setVerifying(true);
            // Short delay to show the indicator before context update/navigation
            await new Promise(resolve => setTimeout(resolve, 800));
            // --------------------------------

            if (response.loggedIn === true) {
                console.log("OTP verified for existing user. Logging in...");
                if (!response.token || !response.user) {
                    console.error("Login response missing token or user data:", response);
                    setError("Verification successful, but login failed due to missing data.");
                    setVerifying(false); // Hide verifying indicator on error
                } else {
                    login(response.token, response.user); // Update context
                    // Navigation might feel implicit due to ProtectedRoute logic in App.jsx now
                    // But explicit navigation is safer.
                    navigate(response.user?.role === 'admin' ? '/admin/dashboard' : '/new-booking', { replace: true });
                }
            } else if (response.needsDetails === true) {
                console.log("OTP verified for new user. Navigating to complete registration...");
                if (!response.registrationToken || !response.phone) {
                    console.error("Registration initiation response missing token or phone:", response);
                    setError("Verification succeeded, but registration cannot proceed due to missing data.");
                     setVerifying(false); // Hide verifying indicator on error
                } else {
                    navigate('/complete-registration', {
                      state: { phone: response.phone, registrationToken: response.registrationToken },
                      replace: true
                    });
                }
            } else {
                 console.error("Unexpected success response structure from verify-otp:", response);
                 setError("An unexpected verification response was received.");
                 setVerifying(false); // Hide verifying indicator on error
            }
        } catch (err) {
            console.error("Verify OTP Error in Component:", err);
            setError(err.message || 'An unexpected error occurred during verification.');
            setVerifying(false); // Hide verifying indicator on error
        } finally {
            // Keep loading true while verifying, only set to false if verify step fails before navigation
            if (!verifying) { // Only set loading false if we are not in the 'verifying' success state
                 setLoading(false);
            }
        }
    };

    const handleResendOtp = async () => {
        if (!canResend || !phone || loading || verifying) return;
        setLoading(true); setError('');
        try {
            console.log(`Resending OTP to ${phone}`);
            await sendOtp(phone);
            setOtp(''); setResendTimer(60); setCanResend(false);
            otpInputRef.current?.focus();
            console.log("New OTP sent successfully (logged).");
        } catch (err) { console.error("Resend OTP Error:", err); setError(err.message || 'Failed to resend OTP.'); }
        finally { setLoading(false); }
    };

    // Render error state if phone number is missing
    if (!phone && !error) {
        return <LoadingScreen message="Loading details..." />; // Show loader briefly if phone is missing initially
    }
     if (error && !phone) {
        return ( <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center"> <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2> <p className="text-gray-700 mb-6">{error}</p> <button onClick={() => navigate('/')} className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors">Go Back</button> </div> );
     }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-200"
            >
                <h2 className="text-3xl font-bold text-center text-gray-900">Enter OTP</h2>
                <p className="text-center text-sm text-gray-600">
                    A 6-digit code has been sent to <br/> <span className="font-semibold text-gray-800">{phone}</span>
                </p>

                {/* Conditional Rendering for Verifying State */}
                {verifying ? (
                     <motion.div
                        key="verifying"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-10 text-center"
                    >
                        <CheckCircle size={48} className="text-green-500 mb-4" />
                        <p className="text-lg font-medium text-gray-700">Verification Successful!</p>
                        <p className="text-sm text-gray-500">Please wait...</p>
                        <Loader2 className="animate-spin h-6 w-6 text-primary mt-4" />
                    </motion.div>
                ) : (
                    // Show OTP form if not verifying
                    <motion.form
                        key="otp-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div>
                            <label htmlFor="otp" className="sr-only">OTP</label>
                            <input
                                id="otp" name="otp" type="tel" inputMode="numeric"
                                value={otp} onChange={handleOtpChange} placeholder="------"
                                maxLength={6} required ref={otpInputRef} disabled={loading}
                                className="w-full px-4 py-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl tracking-[0.5em] font-semibold" // Larger font, more tracking
                                autoComplete="one-time-code"
                            />
                        </div>

                        {error && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 transition duration-150 ease-in-out transform hover:scale-[1.02]"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>

                        <div className="text-center text-sm">
                            {canResend ? (
                                <button type="button" onClick={handleResendOtp} disabled={loading} className="font-medium text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed underline">
                                    Resend OTP
                                </button>
                            ) : (
                                <p className="text-gray-500">Resend OTP in {resendTimer}s</p>
                            )}
                        </div>
                    </motion.form>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyOtpPage;
