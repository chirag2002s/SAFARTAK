// src/components/LanguageSwitcher.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation(); // Get the i18n instance

  // Function to change the language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Tell i18next to change the language
    console.log(`Language changed to: ${lng}`);
  };

  // Get the current language to style the active button (optional)
  const currentLanguage = i18n.language;

  return (
    <div className="flex space-x-2 items-center">
      {/* English Button */}
      <button
        onClick={() => changeLanguage('en')}
        disabled={currentLanguage === 'en'} // Disable if already selected
        className={`px-3 py-1 text-xs rounded transition duration-200 ${
          currentLanguage === 'en'
            ? 'bg-accent text-white cursor-default' // Style for active language
            : 'bg-gray-600 hover:bg-gray-500 text-gray-200' // Style for inactive language
        }`}
      >
        English
      </button>

      {/* Hindi Button */}
      <button
        onClick={() => changeLanguage('hi')}
        disabled={currentLanguage === 'hi'} // Disable if already selected
        className={`px-3 py-1 text-xs rounded transition duration-200 ${
          currentLanguage === 'hi'
            ? 'bg-accent text-white cursor-default' // Style for active language
            : 'bg-gray-600 hover:bg-gray-500 text-gray-200' // Style for inactive language
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}

export default LanguageSwitcher;
