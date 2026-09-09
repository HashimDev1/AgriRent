import React from 'react';
import { useNavigate } from 'react-router-dom';

const MobileBackButton = () => {
  const navigate = useNavigate();

  return (
    <div className="md:hidden flex items-center justify-between pb-3.5 mb-5 border-b border-gray-100">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-1.5 text-gray-500 hover:text-primary-700 transition-colors font-bold text-xs uppercase tracking-wider group"
      >
        <span className="text-sm transform group-hover:-translate-x-1 transition-transform">←</span>
        <span>Go Back</span>
      </button>
      <button
        onClick={() => navigate('/')}
        className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-wider flex items-center space-x-1"
      >
        <span>Home Page</span>
        <span>🏠</span>
      </button>
    </div>
  );
};

export default MobileBackButton;
