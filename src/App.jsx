// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import Layout Component
import MainLayout from './layouts/MainLayout';

// Import Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage'; // Keep import if /login route exists
import SignupPage from './pages/SignupPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import CompleteRegistrationPage from './pages/CompleteRegistrationPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import NewBookingPage from './pages/NewBookingPage';
import PassengerDetailsPage from './pages/PassengerDetailsPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';

// Import Helper Components
import ProtectedRoute from './routes/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import SplashScreen from './components/SplashScreen';
import { AnimatePresence } from 'framer-motion';

// --- App Structure ---
function AppContent() {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const location = useLocation();

  // State to control splash screen visibility
  const [showSplash, setShowSplash] = useState(true); // Start with splash visible

  // Effect to hide splash screen after a delay
  useEffect(() => {
    console.log("[AppContent] Splash Effect Mounted. Setting timer..."); // Log effect mount
    const timer = setTimeout(() => {
      console.log("[AppContent] Splash timer finished. Setting showSplash to false.");
      setShowSplash(false);
    }, 2500); // Show splash for 2.5 seconds (adjust as needed)

    // Cleanup function to clear the timer if the component unmounts early
    return () => {
        console.log("[AppContent] Splash Effect Cleanup: Clearing timer.");
        clearTimeout(timer);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  console.log("[AppContent] Rendering. showSplash:", showSplash, "authIsLoading:", authIsLoading, "isAuthenticated:", isAuthenticated, "Path:", location.pathname);

  // --- Routing Logic ---

  // 1. Show Splash Screen initially
  if (showSplash) {
      console.log("[AppContent] Rendering SplashScreen.");
      // AnimatePresence helps with exit animations if defined in SplashScreen
      return <AnimatePresence>{showSplash && <SplashScreen />}</AnimatePresence>;
  }

  // 2. Show Loading Screen while checking auth (after splash)
  if (authIsLoading) {
    console.log("[AppContent] Auth loading... Rendering LoadingScreen.");
    return <LoadingScreen message="Checking session..." />;
  }

  // Define public paths accessible when logged out
  const publicAuthPaths = ['/login', '/register', '/verify-otp', '/complete-registration', '/admin/login'];

  // 3. Authentication Check & Redirection (after splash & auth loading):
  if (!isAuthenticated && !publicAuthPaths.includes(location.pathname) && location.pathname !== '/') {
      console.log("[AppContent] NOT authenticated, redirecting to / from", location.pathname); // Redirect to HomePage (phone entry)
      return <Navigate to="/" replace />;
  }
  if (isAuthenticated && publicAuthPaths.includes(location.pathname)) {
      console.log("[AppContent] IS authenticated, redirecting from auth page to /new-booking");
      return <Navigate to="/new-booking" replace />;
  }

  // 4. Render Routes if checks pass
  console.log("[AppContent] Proceeding to render Routes.");
  return (
    <Routes>
      {/* Public Routes (No Layout) */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/new-booking" replace /> : <HomePage />} />
      {/* Add back /login if you have a separate email/password login page */}
      {/* <Route path="/login" element={isAuthenticated ? <Navigate to="/new-booking" replace /> : <LoginPage />} /> */}
      <Route path="/register" element={isAuthenticated ? <Navigate to="/new-booking" replace /> : <SignupPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/verify-otp" element={isAuthenticated ? <Navigate to="/new-booking" replace /> : <VerifyOtpPage />} />
      <Route path="/complete-registration" element={isAuthenticated ? <Navigate to="/new-booking" replace /> : <CompleteRegistrationPage />} />

      {/* Protected Routes (WITH Layout) */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={ <ProtectedRoute> <NewBookingPage /> </ProtectedRoute> } />
        <Route path="/new-booking" element={ <ProtectedRoute> <NewBookingPage /> </ProtectedRoute> } />
        <Route path="/passenger-details" element={ <ProtectedRoute> <PassengerDetailsPage /> </ProtectedRoute> } />
        <Route path="/booking-confirmation" element={ <ProtectedRoute> <BookingConfirmationPage /> </ProtectedRoute> } />
        <Route path="/my-bookings" element={ <ProtectedRoute> <BookingHistoryPage /> </ProtectedRoute> } />
        <Route path="/profile" element={ <ProtectedRoute> <ProfilePage /> </ProtectedRoute> } />
        <Route path="/admin/dashboard" element={ <ProtectedRoute allowedRoles={['admin']}> <AdminDashboardPage /> </ProtectedRoute> } />
      </Route>

      {/* Catch-all Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}


function App() {
  return (
    <AuthProvider>
        {/* Router (BrowserRouter) should wrap <App /> in main.jsx */}
        <AppContent />
    </AuthProvider>
  );
}

export default App;
