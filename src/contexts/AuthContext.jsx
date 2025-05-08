// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../services/authService'; // <-- Import getMe

// Create the context
const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start as true
  const navigate = useNavigate();

  console.log('[AuthProvider] Initializing: Token from storage =', token); // Log initial token state

  // Effect to check token and fetch user data on initial load
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    console.log('[AuthProvider] useEffect triggered. Current loading state:', loading);

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      console.log('[AuthProvider] Inside initializeAuth: storedToken =', storedToken);

      if (storedToken) {
        console.log("[AuthProvider] Token found, attempting to fetch user...");
        try {
          // Set token state immediately if found in storage
          // This might help ProtectedRoute evaluate isAuthenticated earlier
          if (isMounted) {
             setToken(storedToken); // Ensure token state is set
             console.log('[AuthProvider] Set token state from storage.');
          }

          const userData = await getMe(storedToken); // Call API
          console.log("[AuthProvider] getMe response:", userData);

          if (userData && isMounted) {
            // If successful, set user state
            setUser(userData);
            console.log("[AuthProvider] User data fetched successfully:", userData);
          } else if (isMounted) {
            // Handle case where getMe might not return data or component unmounted
             console.error("[AuthProvider] getMe returned no data or component unmounted. Logging out.");
             // Call logout without navigate if component might be unmounted during async op
             localStorage.removeItem('authToken');
             setToken(null);
             setUser(null);
             // Navigate only if mounted, otherwise let ProtectedRoute handle redirect
             if (isMounted) navigate('/login');
          }
        } catch (error) {
          // If getMe fails (e.g., token expired/invalid), log out
          console.error("[AuthProvider] Failed to fetch user with stored token:", error.message);
           if (isMounted) {
             // Call logout without navigate if component might be unmounted during async op
             localStorage.removeItem('authToken');
             setToken(null);
             setUser(null);
             // Navigate only if mounted
             navigate('/login');
           }
        }
      } else {
          console.log("[AuthProvider] No stored token found.");
          // Ensure user/token state are null if no token
          if (isMounted) {
              setToken(null);
              setUser(null);
          }
      }

      // Finished initialization attempt
      if (isMounted) {
        console.log("[AuthProvider] Setting loading to false.");
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup function to set isMounted to false when component unmounts
    return () => {
        console.log("[AuthProvider] Cleanup: Component unmounting.");
        isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on initial mount


  // Login function
  const login = (newToken, userData) => {
    console.log("[AuthProvider] login function called.");
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setUser(userData);
    console.log("[AuthProvider] Logged in, user data set:", userData);
  };

  // Logout function
  const logout = () => {
    console.log("[AuthProvider] logout function called.");
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setLoading(false); // Ensure loading is false on logout
    console.log("[AuthProvider] Navigating to /login after logout.");
    navigate('/login'); // Navigate after state updates
  };

  // Value provided by the context
  const value = {
    token,
    user,
    isAuthenticated: !!token, // Still based on token presence
    loading, // Expose loading state
    login,
    logout,
  };

  console.log("[AuthProvider] Rendering Provider. Loading:", loading, "IsAuthenticated:", !!token, "User:", user ? user.name : null);

  // Render children immediately, ProtectedRoute will handle loading state
  // Removed the {!loading && children} check here as ProtectedRoute handles it
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
