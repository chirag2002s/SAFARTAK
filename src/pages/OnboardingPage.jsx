// src/pages/OnboardingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react'; // Example icon

function OnboardingPage() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        // Mark onboarding as completed in local storage
        localStorage.setItem('onboardingCompleted', 'true');
        // Navigate to the login/register page
        navigate('/login'); // Adjust if your phone entry page has a different route
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-accent p-6 text-white">
            {/* You can add your logo here */}
            {/* <img src="/logo.png" alt="Safartak Logo" className="w-32 h-auto mb-8" /> */}
             <h1 className="text-5xl font-bold mb-4 text-center">
                Welcome to <span className="font-extrabold">Safartak!</span>
             </h1>
             <p className="text-xl text-center text-white/80 mb-12 max-w-md">
                Your comfortable and reliable shuttle booking experience starts here.
             </p>

             {/* Add illustrations or feature highlights if desired */}
             {/* <div className="mb-12"> ... illustrations ... </div> */}

             <button
                onClick={handleGetStarted}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-primary text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-primary"
            >
                Get Started <ArrowRight size={20} />
             </button>
        </div>
    );
}

export default OnboardingPage;
