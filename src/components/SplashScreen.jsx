// src/components/SplashScreen.jsx
import React from 'react';
import { motion } from 'framer-motion'; // Import motion

function SplashScreen() {
  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
    exit: { opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }
  };

  // Animation variants for the image/logo (e.g., scale up)
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
        delay: 0.2 // Delay slightly after background fades in
      }
    }
  };

  return (
    // Full screen container with gradient
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary to-accent p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit" // Define exit animation for smooth transition out
    >
      {/* Animated Logo/Image */}
      <motion.div variants={itemVariants}>
        <img
          src="/hulu.png" // Path to your image in the public folder
          alt="Safartak Loading"
          className="w-48 h-auto mb-4" // Adjust size as needed
        />
      </motion.div>

      {/* Animated Tagline */}
      <motion.p
        className="text-xl text-white/80 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Smart Shuttle, Smarter Travel
      </motion.p>

        {/* Optional: Subtle Loading Indicator */}
        <motion.div
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
        >
            <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "linear", delay: 1.2 }} // Animate width over time
                />
            </div>
        </motion.div>

    </motion.div>
  );
}

export default SplashScreen;
