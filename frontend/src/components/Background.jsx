import React from 'react';

const Background = ({ children, showBackground = false }) => {
  return (
    <div 
      className="relative min-h-screen flex items-center justify-center"
      style={showBackground ? {
        backgroundImage: `url('https://thumbs.dreamstime.com/b/giving-helping-hand-hands-man-woman-reaching-to-each-other-support-rescue-gesture-lending-solidarity-compassion-296184706.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      } : {}}
    >
      {showBackground && (
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      )}

      {/* Content Wrapper */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};

export default Background;