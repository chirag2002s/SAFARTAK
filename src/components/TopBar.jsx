// src/components/TopBar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft } from 'lucide-react'; // Menu (hamburger) and Back icons
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

function TopBar({ onMenuClick }) { // onMenuClick is the toggleSidebar function from MainLayout
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth(); // Get auth state and user info

    // Determine if we are on a "top-level" page where a back button isn't needed
    // Adjust these paths based on your main navigation items
    const topLevelPaths = ['/', '/new-booking', '/my-bookings', '/profile', '/dashboard', '/admin/dashboard'];
    const showBackButton = !topLevelPaths.includes(location.pathname);

    const handleBackClick = () => {
        console.log("[TopBar] Back button clicked.");
        navigate(-1); // Go back to the previous page in history
    };

     const handleMenuClick = () => {
        // *** ADDED LOGGING FOR DEBUGGING ***
        console.log("[TopBar] Menu button clicked. Calling onMenuClick prop.");
        if (onMenuClick) {
            onMenuClick(); // This should call toggleSidebar in MainLayout
        } else {
            console.error("[TopBar] onMenuClick prop is missing!");
        }
        // **********************************
    };

    // Determine the correct link for the logo based on auth state and role
    let logoLinkPath = '/'; // Default to homepage for non-logged-in users
    if (isAuthenticated) {
        logoLinkPath = user?.role === 'admin' ? '/admin/dashboard' : '/new-booking';
    }

    // Button Styles for Outline Effect
    // Common base styles
    const buttonBaseClasses = "flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
    // Outline style using accent color for border and hover background
    // Text color is removed here, applied directly to the icon
    const outlineButtonClasses = `${buttonBaseClasses} border-accent hover:bg-accent focus:ring-accent group`; // Added group for potential group-hover on icon


    return (
        <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-md sticky top-0 z-30 h-16 flex items-center px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between w-full">
                {/* Left Side: Menu or Back Button */}
                <div className="flex items-center">
                    {showBackButton ? (
                        <button
                            onClick={handleBackClick}
                            className={outlineButtonClasses} // Use outline style
                            aria-label="Go back"
                        >
                            {/* Apply text color directly to the icon, change on button hover */}
                            <ArrowLeft size={20} className="text-accent group-hover:text-white transition-colors" />
                        </button>
                    ) : (
                        // Show menu button only if authenticated
                        isAuthenticated && (
                             <button
                                onClick={handleMenuClick} // *** Use the handler ***
                                className={outlineButtonClasses} // Use outline style
                                aria-label="Open menu"
                            >
                                 {/* Apply text color directly to the icon, change on button hover */}
                                <Menu size={20} className="text-accent group-hover:text-white transition-colors" />
                            </button>
                        )
                    )}
                </div>

                {/* Center: Logo - Use the determined logoLinkPath */}
                 <Link
                     to={logoLinkPath} // Use the dynamic path
                     className="text-2xl font-bold text-accent absolute left-1/2 transform -translate-x-1/2"
                 >
                     <span className="text-white">Safar</span>tak
                 </Link>

                 {/* Right Side Placeholder (for balance) */}
                 <div className="w-10 h-10"></div> {/* Maintain balance for centered logo */}
            </div>
        </header>
    );
}

export default TopBar;
