// src/components/Sidebar.jsx
import React, { useEffect } from 'react'; // Added useEffect for logging
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { X, UserCircle, LayoutDashboard, PlusCircle, History, LogOut, Settings } from 'lucide-react';

function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // *** Log when the component renders and what the isOpen prop is ***
    console.log(`[Sidebar] Rendering. isOpen = ${isOpen}`);
    useEffect(() => {
        console.log(`[Sidebar] isOpen prop changed to: ${isOpen}`);
    }, [isOpen]);
    // *****************************************************************

    const handleLogout = () => {
        logout();
        onClose(); // Close sidebar on logout
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path || (path === '/new-booking' && location.pathname === '/dashboard');

    const sidebarVariants = {
        hidden: { x: '-100%', transition: { type: 'tween', duration: 0.3, ease: 'easeOut' } },
        visible: { x: 0, transition: { type: 'tween', duration: 0.3, ease: 'easeIn' } },
    };

    const linkVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    const listVariants = {
        visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
        hidden: {}
    };

    const userLandingPath = user?.role === 'admin' ? '/admin/dashboard' : '/new-booking';

    return (
        <AnimatePresence>
            {isOpen && ( // Sidebar and overlay only mount when isOpen is true
                <>
                    {/* Overlay */}
                    <motion.div
                        key="sidebar-overlay" // Added key
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black bg-opacity-60 z-40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Sidebar Content */}
                    <motion.div
                        key="sidebar-content" // Added key
                        variants={sidebarVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-900 to-black text-gray-200 shadow-xl z-50 flex flex-col"
                    >
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-700">
                             <Link to="/profile" onClick={onClose} className="flex items-center gap-3 group flex-grow min-w-0 mr-2">
                                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-xl ring-2 ring-white/20">
                                     {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircle size={26} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-base font-semibold group-hover:text-accent transition-colors truncate">{user?.name || 'Profile'}</p>
                                    <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">View Profile</p>
                                </div>
                             </Link>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors flex-shrink-0" aria-label="Close menu">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <motion.nav
                            className="flex-grow p-4 space-y-1.5 overflow-y-auto"
                            variants={listVariants}
                            initial="hidden"
                            animate="visible"
                        >
                             <motion.div variants={linkVariants}>
                                <Link to={userLandingPath} onClick={onClose} className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group ${isActive(userLandingPath) ? 'bg-accent text-white shadow-md scale-[1.02]' : 'text-gray-300 hover:bg-white/10 hover:text-white hover:pl-5'}`}>
                                    <LayoutDashboard size={20} className={`transition-transform group-hover:scale-110 ${isActive(userLandingPath) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                    <span>{user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}</span>
                                </Link>
                             </motion.div>
                             <motion.div variants={linkVariants}>
                                <Link to="/new-booking" onClick={onClose} className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group ${isActive('/new-booking') && !isActive(userLandingPath) ? 'bg-accent text-white shadow-md scale-[1.02]' : 'text-gray-300 hover:bg-white/10 hover:text-white hover:pl-5'}`}>
                                    <PlusCircle size={20} className={`transition-transform group-hover:scale-110 ${isActive('/new-booking') && !isActive(userLandingPath) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                    <span>New Booking</span>
                                </Link>
                             </motion.div>
                             <motion.div variants={linkVariants}>
                                <Link to="/my-bookings" onClick={onClose} className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group ${isActive('/my-bookings') ? 'bg-accent text-white shadow-md scale-[1.02]' : 'text-gray-300 hover:bg-white/10 hover:text-white hover:pl-5'}`}>
                                    <History size={20} className={`transition-transform group-hover:scale-110 ${isActive('/my-bookings') ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                    <span>My Bookings</span>
                                </Link>
                             </motion.div>
                             <motion.div variants={linkVariants}>
                                <Link to="/profile" onClick={onClose} className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group ${isActive('/profile') ? 'bg-accent text-white shadow-md scale-[1.02]' : 'text-gray-300 hover:bg-white/10 hover:text-white hover:pl-5'}`}>
                                    <Settings size={20} className={`transition-transform group-hover:scale-110 ${isActive('/profile') ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                    <span>Profile Settings</span>
                                </Link>
                             </motion.div>
                        </motion.nav>

                        {/* Footer/Logout */}
                        <div className="p-4 border-t border-gray-700 mt-auto">
                            <motion.button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium py-2.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-200" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                                <LogOut size={18} /> Logout
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default Sidebar;
