// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth(); // Get loading state
  const location = useLocation();

  console.log(`[ProtectedRoute] Path: ${location.pathname}. Loading: ${loading}, IsAuthenticated: ${isAuthenticated}, User Role: ${user?.role}`);

  // 1. Handle Initial Loading State
  if (loading) {
    console.log(`[ProtectedRoute] Path: ${location.pathname}. Still loading auth state.`);
    // It's important to show a loading indicator or return null here
    // Avoid rendering children or redirecting until loading is false
    return <div className="flex justify-center items-center h-screen"><p>Authenticating...</p></div>; // Or a spinner component
  }

  // 2. Check if Authenticated (AFTER loading is false)
  if (!isAuthenticated) {
    console.log(`[ProtectedRoute] Path: ${location.pathname}. Not authenticated. Redirecting to login.`);
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Check Role (if allowedRoles is provided)
  // Ensure user object exists and has a role before checking
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    console.warn(`[ProtectedRoute] Path: ${location.pathname}. Unauthorized access attempt by role: ${user?.role}. Allowed: ${allowedRoles.join(', ')}. Redirecting.`);
    // User is authenticated but doesn't have the required role
    // Redirect to a 'not authorized' page or home page
    return <Navigate to="/" state={{ from: location }} replace />; // Redirect to home
    // Or render an 'Unauthorized' component: return <UnauthorizedPage />;
  }

  // 4. User is Authenticated and has the required role (or no role restriction)
  console.log(`[ProtectedRoute] Path: ${location.pathname}. Access granted.`);
  return children; // Render the protected component
}

export default ProtectedRoute;
