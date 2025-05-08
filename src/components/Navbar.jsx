// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
// *** Verify this import path is correct relative to Navbar.jsx ***
import { useAuth } from '../contexts/AuthContext'; // Assuming AuthContext.jsx is in src/contexts/
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher'; // Assuming LanguageSwitcher is in the same directory
// *** Added UserCircle icon ***
import { LogOut, LayoutDashboard, PlusCircle, History, UserCircle } from 'lucide-react';

function Navbar() {
  // Ensure useAuth() is called correctly here
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate(); // Added navigate hook

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
   };

  const userLandingPath = user?.role === 'admin' ? '/admin/dashboard' : '/new-booking';
  const logoLinkPath = isAuthenticated ? userLandingPath : '/';

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-primary text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Side: Brand Logo Link */}
        <Link to={logoLinkPath} className="flex items-center gap-1 text-4xl font-bold">
           <span className="text-white">Safar</span>
           <span className="text-accent">tak</span>
        </Link>

        {/* Right Side: Links and Switcher */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="hidden sm:flex items-center space-x-4 md:space-x-5">
            {isAuthenticated ? (
              // Links shown when user IS logged in
              <>
                <Link
                    to={userLandingPath}
                    title={t('nav.dashboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors duration-200 text-sm ${isActive(userLandingPath) ? 'bg-accent text-white' : 'hover:bg-white/10'}`}
                 >
                   <LayoutDashboard size={16} /> {user?.role === 'admin' ? 'Admin' : t('nav.dashboard')} {/* Adjust text for admin */}
                </Link>
                 <Link
                    to="/new-booking"
                    title={t('nav.newBooking')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors duration-200 text-sm ${isActive('/new-booking') && userLandingPath !== '/new-booking' ? 'bg-accent text-white' : 'hover:bg-white/10'}`}
                 >
                   <PlusCircle size={16} /> {t('nav.newBooking')}
                </Link>
                 <Link
                    to="/my-bookings"
                    title="My Bookings"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors duration-200 text-sm ${isActive('/my-bookings') ? 'bg-accent text-white' : 'hover:bg-white/10'}`}
                 >
                   <History size={16} /> My Bookings
                </Link>

                {/* *** ADDED PROFILE LINK *** */}
                 <Link
                    to="/profile"
                    title="View Profile"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors duration-200 text-sm ${isActive('/profile') ? 'bg-accent text-white' : 'hover:bg-white/10'}`}
                 >
                    <UserCircle size={16} />
                    {/* Show first name or 'Profile' */}
                    {user?.name ? user.name.split(' ')[0] : 'Profile'}
                 </Link>
                 {/* ************************* */}

                <button
                    onClick={handleLogout}
                    title={t('nav.logout')}
                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-1.5 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-primary transition duration-200"
                 >
                   <LogOut size={16} /> {t('nav.logout')}
                </button>
              </>
            ) : (
              // Links shown when user is NOT logged in
              <>
                <Link to="/login" className={`px-3 py-1.5 rounded-md transition-colors duration-200 text-sm ${isActive('/login') ? 'bg-accent text-white' : 'hover:bg-white/10'}`}>{t('nav.login')}</Link>
                <Link to="/register" className={`px-3 py-1.5 rounded-md transition-colors duration-200 text-sm ${isActive('/register') ? 'bg-accent text-white' : 'hover:bg-white/10'}`}>{t('nav.signup')}</Link>
              </>
            )}
          </div>

          {/* Language Switcher */}
          <div className="border-l border-white/20 pl-3 ml-3">
            <LanguageSwitcher />
          </div>
          {/* Hamburger Menu Placeholder */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
