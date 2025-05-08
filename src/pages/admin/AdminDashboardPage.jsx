// src/pages/AdminDashboardPage.jsx (with Schedule Link)
import React from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
import { Link } from 'react-router-dom'; // <-- Import Link component

function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-6">Welcome, Admin {user?.name || 'Admin'}!</p>

      {/* Grid for Admin Management Links/Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Manage Vehicles Card/Link */}
        <Link
          to="/admin/vehicles" // Link to the vehicles management page
          className="block p-6 border rounded-lg shadow bg-white hover:shadow-lg hover:bg-gray-50 transition-all duration-200 ease-in-out" // Make the whole card clickable
        >
          <h2 className="text-xl font-semibold mb-2">Manage Vehicles</h2>
          <p className="text-sm text-gray-600">Add, view, edit, or remove vehicles from the fleet.</p>
        </Link>

        {/* Manage Drivers Card/Link */}
        <Link
          to="/admin/drivers" // <-- Link to the drivers management page
          className="block p-6 border rounded-lg shadow bg-white hover:shadow-lg hover:bg-gray-50 transition-all duration-200 ease-in-out" // Make the whole card clickable
        >
          <h2 className="text-xl font-semibold mb-2">Manage Drivers</h2>
          <p className="text-sm text-gray-600">Add, view, edit, or remove drivers.</p>
        </Link>

        {/* Manage Bookings Card/Link */}
        <Link
          to="/admin/bookings" // <-- Link to the bookings management page
          className="block p-6 border rounded-lg shadow bg-white hover:shadow-lg hover:bg-gray-50 transition-all duration-200 ease-in-out" // Make the whole card clickable
        >
          <h2 className="text-xl font-semibold mb-2">Manage Bookings</h2>
           <p className="text-sm text-gray-600">View all bookings and manage assignments.</p>
       </Link>

       {/* --- NEW: Manage Schedules Card/Link --- */}
       <Link
          to="/admin/schedules/new" // <-- Link to Add New Schedule page for now
          // Link to "/admin/schedules" later when list page exists
          className="block p-6 border rounded-lg shadow bg-white hover:shadow-lg hover:bg-gray-50 transition-all duration-200 ease-in-out"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Schedules</h2>
           <p className="text-sm text-gray-600">Create new ride schedules for routes.</p>
       </Link>
       {/* ------------------------------------ */}


      </div>
    </div>
  );
}

export default AdminDashboardPage;
