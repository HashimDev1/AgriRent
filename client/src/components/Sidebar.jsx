import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const getLinks = (roleVal) => {
    switch (roleVal) {
      case 'farmer':
        return [
          { to: '/farmer-dashboard', label: 'Farmer Home', icon: '🌾' },
          { to: '/equipment', label: 'Rent Machinery', icon: '🔍' },
          { to: '/farmer-bookings', label: 'My Bookings', icon: '📅' },
          { to: '/disputes', label: 'Disputes & Claims', icon: '⚠️' },
          { to: '/notifications', label: 'Notifications', icon: '🔔' },
          { to: '/profile', label: 'My Profile', icon: '👤' },
        ];
      case 'owner':
        return [
          { to: '/owner-dashboard', label: 'Owner Home', icon: '📈' },
          { to: '/my-equipment', label: 'My Equipment', icon: '🚜' },
          { to: '/add-equipment', label: 'Add Equipment', icon: '➕' },
          { to: '/owner-bookings', label: 'Booking Requests', icon: '📥' },
          { to: '/disputes', label: 'Disputes Log', icon: '⚠️' },
          { to: '/notifications', label: 'Notifications', icon: '🔔' },
          { to: '/profile', label: 'My Profile', icon: '👤' },
        ];
      case 'admin':
        return [
          { to: '/admin-dashboard', label: 'Admin Console', icon: '🛡️' },
          { to: '/admin-dashboard#verify-users', label: 'Verify Users', icon: '👥' },
          { to: '/admin-dashboard#verify-listings', label: 'Approve Listings', icon: '📋' },
          { to: '/admin-dashboard#disputes', label: 'Handle Disputes', icon: '⚖️' },
          { to: '/notifications', label: 'Notifications', icon: '🔔' },
          { to: '/profile', label: 'Admin Profile', icon: '👤' },
        ];
      default:
        return [];
    }
  };

  const links = getLinks(role);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] shadow-sm hidden md:block">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigation Context</p>
        <p className="text-sm font-bold text-gray-700 capitalize mt-0.5">{role} Mode</p>
      </div>
      <nav className="p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600 pl-3 shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
              }`
            }
          >
            <span className="text-base">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
