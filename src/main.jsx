// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Your Tailwind CSS directives
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx'; // Ensure correct extension

// --- Import the i18n configuration ---
import './i18n'; // This runs the i18n.js file and initializes i18next
// ------------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* AuthProvider provides authentication context */}
        {/* App component contains the main structure and routing */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
