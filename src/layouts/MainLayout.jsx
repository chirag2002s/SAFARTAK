// src/layouts/MainLayout.jsx
import React, { useState, useEffect } from 'react'; // Added useEffect for logging
import { Outlet, useLocation } from 'react-router-dom'; // Added useLocation
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation(); // Get current location

    // Log whenever the sidebar state changes
    useEffect(() => {
        console.log("[MainLayout] isSidebarOpen state changed:", isSidebarOpen);
    }, [isSidebarOpen]);

    // Log when the location changes (useful for debugging layout issues on navigation)
     useEffect(() => {
        console.log("[MainLayout] Location changed:", location.pathname);
        // Close sidebar automatically on route change
        setIsSidebarOpen(false);
    }, [location]);

    const toggleSidebar = () => {
        console.log("[MainLayout] toggleSidebar called. Current state:", isSidebarOpen, "New state:", !isSidebarOpen);
        setIsSidebarOpen(prevState => !prevState); // Use functional update for reliability
    };

    const closeSidebar = () => {
        console.log("[MainLayout] closeSidebar called.");
        setIsSidebarOpen(false);
    };

    console.log("[MainLayout] Rendering. isSidebarOpen:", isSidebarOpen); // Log on every render

    return (
        <div className="flex flex-col min-h-screen">
            {/* Render the new TopBar, passing the function to open the sidebar */}
            <TopBar onMenuClick={toggleSidebar} />
      
            {/* Render the Sidebar, passing state and close function */}
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            {/* Main content area */}
            {/* Added padding top to prevent content from going under sticky TopBar */}
            <main className="flex-grow container mx-auto p-4 pt-20 sm:pt-24">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default MainLayout;
