// src/i18n.js (Hardcoded English Only - Skips File Loading)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// HttpApi backend is commented out as we are hardcoding resources
// import HttpApi from 'i18next-http-backend';
// Language detector is also not needed if we force English
// import LanguageDetector from 'i18next-browser-languagedetector';

// --- Hardcoded English Resources ---
// Contains all the keys needed for currently translated components
const resources = {
  en: { // Define only the English language
    translation: { // Default namespace
      "appName": "Safartak",
      "nav": {
        "home": "Home",
        "login": "Login",
        "signup": "Sign Up",
        "dashboard": "Dashboard",
        "newBooking": "New Booking",
        "logout": "Logout",
        "greeting": "Hi, {{name}}!"
      },
      "footer": {
        "copyright": "© {{year}} Safartak. All rights reserved."
      },
      "homePage": {
        "title": "Home Page (Safartak)",
        "welcome": "Welcome to Safartak Shuttle Service!"
      },
      "loginPage": {
        "title": "Login to Safartak",
        "emailLabel": "Email",
        "passwordLabel": "Password",
        "button": "Sign In",
        "loadingButton": "Logging in...",
        "adminLoginLink": "Admin Login"
      },
      "signupPage": {
        "title": "Create Safartak Account",
        "nameLabel": "Name",
        "emailLabel": "Email",
        "phoneLabel": "Phone Number",
        "passwordLabel": "Password",
        "confirmPasswordLabel": "Confirm Password",
        "button": "Sign Up",
        "loadingButton": "Registering...",
        "loginLink": "Already have an account? Login"
      },
      "adminLoginPage": {
        "title": "Admin Login",
        "emailLabel": "Admin Email",
        "passwordLabel": "Password",
        "button": "Admin Sign In",
        "loadingButton": "Logging in..."
      }
      // Add keys for other components as you translate them
    }
  }
  // No 'hi' resources included in this version
};
// ---------------------------------

i18n
  // HttpApi and LanguageDetector are not used
  .use(initReactI18next)
  .init({
    resources, // Use the hardcoded resources object
    lng: 'en', // Force English as the language
    fallbackLng: 'en', // Fallback is also English
    // supportedLngs: ['en'], // Only support English for now

    debug: false, // Turn off debug for cleaner console unless needed

    // No backend needed
    // backend: { ... },

    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;
