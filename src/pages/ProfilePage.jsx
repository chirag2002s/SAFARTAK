// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Edit, KeyRound, LogOut, Bell, Bookmark, MapPin, Phone, Mail, Loader2 } from 'lucide-react'; // Added Loader2

// *** 1. Import the service functions ***
import { updateUserDetails, updateUserPassword } from '../services/userService'; // Adjust path if needed

function ProfilePage() {
    const { user, token, logout, setUser } = useAuth();
    const navigate = useNavigate();

    // State for user details form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState('');
    const [detailsSuccess, setDetailsSuccess] = useState('');
    const [detailsLoading, setDetailsLoading] = useState(false);

    // State for password change form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Populate form fields when user data is available/changes
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    // --- Handlers for Updating Details ---
    const handleDetailsUpdate = async (e) => {
        e.preventDefault();
        setDetailsError('');
        setDetailsSuccess('');
        setDetailsLoading(true);

        const updatedDetails = {
            name: name.trim(),
            // Only include email/phone if they are not empty strings
            ...(email.trim() && { email: email.trim() }),
            ...(phone.trim() && { phone: phone.trim() }),
        };

        // Basic validation
        if (!updatedDetails.name) {
             setDetailsError('Name cannot be empty.');
             setDetailsLoading(false);
             return;
        }
         if (updatedDetails.email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(updatedDetails.email)) {
             setDetailsError('Please enter a valid email address.');
             setDetailsLoading(false);
             return;
         }
        // Add phone validation if needed

        console.log("Updating details:", updatedDetails);

        try {
            // *** 2. Call the actual service function ***
            const returnedUserData = await updateUserDetails(updatedDetails, token);

            // Update user context with the data returned from the API
            setUser(returnedUserData);

            setDetailsSuccess('Profile updated successfully!');
            setIsEditingDetails(false); // Exit edit mode on success
             setTimeout(() => setDetailsSuccess(''), 3000); // Clear success message after 3s

        } catch (error) {
            console.error("Error updating details:", error);
            setDetailsError(error.message || 'Failed to update details.');
        } finally {
            setDetailsLoading(false);
        }
    };

    // --- Handlers for Changing Password ---
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('Please fill in all password fields.');
            return;
        }
        if (newPassword.length < 6) {
             setPasswordError('New password must be at least 6 characters.');
             return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }
        if (currentPassword === newPassword) {
             setPasswordError('New password cannot be the same as the current one.');
             return;
        }

        setPasswordLoading(true);
        console.log("Changing password...");

        try {
            // *** 3. Call the actual service function ***
            const response = await updateUserPassword({ currentPassword, newPassword }, token);

            setPasswordSuccess(response.message || 'Password changed successfully!');
            // Clear fields after successful change
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
             setTimeout(() => setPasswordSuccess(''), 3000); // Clear success message

        } catch (error) {
            console.error("Error changing password:", error);
            setPasswordError(error.message || 'Failed to change password.');
        } finally {
            setPasswordLoading(false);
        }
    };

    // --- Handle Logout ---
    const handleLogout = () => {
        logout(); // Call logout from AuthContext
        navigate('/login'); // Redirect to login page
    };

    // Render loading state if user data isn't available yet
    if (!user) {
        return (
             <div className="min-h-screen flex items-center justify-center bg-gray-100">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
             </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-3xl">
                {/* Profile Header */}
                <div className="text-center mb-10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center text-white text-4xl font-semibold">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User size={40} />}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                    <p className="text-md text-gray-500">{user.email || 'No email provided'}</p>
                    <p className="text-md text-gray-500">{user.phone || 'No phone provided'}</p>
                </div>

                {/* Profile Sections */}
                <div className="space-y-8">

                    {/* Personal Details Section */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                                <User size={20} className="mr-2 text-primary" /> Personal Details
                            </h2>
                            {!isEditingDetails && (
                                <button
                                    onClick={() => { setIsEditingDetails(true); setDetailsError(''); setDetailsSuccess(''); }} // Clear messages on edit
                                    className="text-sm font-medium text-primary hover:text-primary-dark flex items-center"
                                >
                                    <Edit size={14} className="mr-1" /> Edit
                                </button>
                            )}
                        </div>

                        {detailsError && <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded border border-red-200">{detailsError}</p>}
                        {detailsSuccess && <p className="text-green-600 text-sm mb-3 bg-green-50 p-2 rounded border border-green-200">{detailsSuccess}</p>}

                        {!isEditingDetails ? (
                            <div className="space-y-3 text-gray-600">
                                <p><strong className="font-medium text-gray-800">Name:</strong> {user.name}</p>
                                <p><strong className="font-medium text-gray-800">Email:</strong> {user.email || 'Not set'}</p>
                                <p><strong className="font-medium text-gray-800">Phone:</strong> {user.phone || 'Not set'}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleDetailsUpdate} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div className="flex justify-end space-x-3 pt-2">
                                    <button type="button" onClick={() => { setIsEditingDetails(false); setDetailsError(''); setDetailsSuccess(''); setName(user.name); setEmail(user.email); setPhone(user.phone); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
                                    <button type="submit" disabled={detailsLoading} className="min-w-[110px] flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark disabled:opacity-50">
                                        {detailsLoading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Change Password Section */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                         <h2 className="text-xl font-semibold text-gray-700 mb-5 flex items-center">
                            <KeyRound size={20} className="mr-2 text-primary" /> Change Password
                         </h2>

                         {passwordError && <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded border border-red-200">{passwordError}</p>}
                         {passwordSuccess && <p className="text-green-600 text-sm mb-3 bg-green-50 p-2 rounded border border-green-200">{passwordSuccess}</p>}

                         <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                                <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                             <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                                <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                             <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                             <div className="flex justify-end pt-2">
                                <button type="submit" disabled={passwordLoading} className="min-w-[130px] flex justify-center items-center px-6 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark disabled:opacity-50">
                                    {passwordLoading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                                </button>
                            </div>
                         </form>
                    </div>

                     {/* Other Sections (Placeholders) */}
                     <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><Bell size={20} className="mr-2 text-primary" /> Notifications</h2>
                        <p className="text-gray-500 text-sm">Notification preferences coming soon.</p>
                     </div>
                     <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><Bookmark size={20} className="mr-2 text-primary" /> Saved Locations/Routes</h2>
                         <p className="text-gray-500 text-sm">Functionality to save favorite routes coming soon.</p>
                     </div>

                     {/* Logout Button */}
                     <div className="text-center mt-10">
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <LogOut size={16} className="mr-2" /> Logout
                        </button>
                     </div>

                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
