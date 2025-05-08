// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This is equivalent to --host in the CLI, makes it listen on all local IPs
    port: 5173, // Or your preferred port
    // --- Add this section ---
    hmr: {
      clientPort: 443, // For ngrok to work with HMR (Hot Module Replacement) over HTTPS
    },
    // --- End of HMR section ---
    allowedHosts: [
      '7405-2409-40e3-2059-f19b-c11c-fbc-c115-303b.ngrok-free.app', // Your specific ngrok URL
      // You can add more hosts here if needed, e.g., other ngrok URLs or custom domains
    ],
  },
});
