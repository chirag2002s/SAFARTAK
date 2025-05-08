import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-primary text-gray-400 p-4 mt-8 text-center"> {/* Should now be black bg */}
      <div className="container mx-auto">
        <p>&copy; {currentYear} Safartak. All rights reserved.</p>
      </div>
    </footer>
  );
}
export default Footer;