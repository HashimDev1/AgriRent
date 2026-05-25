import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 bg-gray-50/50">
      <div className="text-center space-y-6 max-w-md bg-white p-8 rounded-2xl border border-gray-150 shadow-sm">
        <span className="text-6xl block">🚜</span>
        <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">404 - Not Found</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          The agricultural machinery route or portal page you requested does not exist or has been relocated.
        </p>
        <Link
          to="/"
          className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-6 py-3 rounded-lg text-sm inline-block shadow-sm transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
