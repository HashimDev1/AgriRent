import React from 'react';

const DashboardCard = ({ title, value, icon, color = 'primary' }) => {
  const colorStyles = {
    primary: 'bg-primary-50 border-primary-100 text-primary-700 hover:border-primary-200',
    earth: 'bg-earth-50 border-earth-100 text-earth-700 hover:border-earth-200',
    amber: 'bg-amber-50 border-amber-100 text-amber-700 hover:border-amber-200',
    blue: 'bg-blue-50 border-blue-100 text-blue-700 hover:border-blue-200',
    red: 'bg-red-50 border-red-100 text-red-700 hover:border-red-200',
    purple: 'bg-purple-50 border-purple-100 text-purple-700 hover:border-purple-200',
  };

  return (
    <div className={`p-5 rounded-xl border shadow-xs transition-all duration-200 hover:shadow-sm ${colorStyles[color]} flex items-center justify-between`}>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-extrabold text-gray-800 mt-2">{value}</h3>
      </div>
      <span className="text-3xl p-3 bg-white rounded-lg shadow-2xs border border-white/50">{icon}</span>
    </div>
  );
};

export default DashboardCard;
