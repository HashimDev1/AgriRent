import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch notifications to get unread count if user is logged in
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const res = await API.get('/notifications');
        const unread = res.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Failed to load notifications count in Navbar:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-2xl transition-transform duration-300 group-hover:rotate-12">🚜</span>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary-700 via-primary-600 to-earth-600 bg-clip-text text-transparent">
                AgriRent
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                location.pathname === '/' ? 'text-primary-700 bg-primary-50/50' : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/equipment"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                location.pathname === '/equipment' ? 'text-primary-700 bg-primary-50/50' : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
              }`}
            >
              Browse Machinery
            </Link>
            <a
              href="/#how-it-works"
              className="text-gray-600 hover:text-primary-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              How It Works
            </a>
            <a
              href="/#categories"
              className="text-gray-600 hover:text-primary-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              Categories
            </a>

            {user ? (
              <>
                {/* Role Specific Navigation Shortcuts */}
                {user.role === 'farmer' && (
                  <>
                    <Link
                      to="/farmer-dashboard"
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        location.pathname === '/farmer-dashboard' ? 'text-primary-700 bg-primary-50/50' : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/farmer-bookings"
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        location.pathname === '/farmer-bookings' ? 'text-primary-700 bg-primary-50/50' : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
                      }`}
                    >
                      My Rentals
                    </Link>
                  </>
                )}

                {user.role === 'owner' && (
                  <>
                    <Link
                      to="/owner-dashboard"
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        location.pathname === '/owner-dashboard' ? 'text-primary-700 bg-primary-50/50' : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/my-equipment"
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        location.pathname === '/my-equipment' ? 'text-primary-700 bg-primary-50/50' : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
                      }`}
                    >
                      My Fleet
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin-dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      location.pathname === '/admin-dashboard' ? 'text-primary-700 bg-primary-50/50' : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
                    }`}
                  >
                    Admin Portal
                  </Link>
                )}

                {/* Notifications Link */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-400 hover:text-primary-600 rounded-full hover:bg-gray-50 transition-all ml-2"
                >
                  <span className="sr-only">View notifications</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-5 w-5 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Link & Logout */}
                <div className="flex items-center space-x-3 border-l border-gray-100 pl-4 ml-2">
                  <Link to="/profile" className="flex items-center space-x-2 group">
                    <img
                      className="h-8 w-8 rounded-full object-cover border-2 border-primary-200 group-hover:border-primary-500 transition-colors"
                      src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={user.name}
                    />
                    <span className="hidden lg:inline-block text-sm font-bold text-gray-700 group-hover:text-primary-700 transition-colors">
                      {user.name}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 border border-gray-200 hover:border-red-200 rounded-lg text-xs font-bold transition-all"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 border-l border-gray-100 pl-4 ml-2">
                <Link to="/login" className="text-gray-600 hover:text-primary-700 text-sm font-bold transition-all px-3 py-2 rounded-lg hover:bg-gray-50">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all shadow-sm hover:shadow-md">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-500 hover:text-primary-600 focus:outline-none p-2 rounded-lg hover:bg-gray-50"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white/95 backdrop-blur-md transition-all duration-300">
          <div className="px-2 pt-2 pb-4 space-y-1">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-700">
              Home
            </Link>
            <Link to="/equipment" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-700">
              Browse Machinery
            </Link>
            <a href="/#how-it-works" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-700">
              How It Works
            </a>
            <a href="/#categories" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-700">
              Categories
            </a>

            {user ? (
              <>
                <div className="border-t border-gray-100 my-2 pt-2"></div>
                {user.role === 'farmer' && (
                  <>
                    <Link to="/farmer-dashboard" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-700">
                      Farmer Dashboard
                    </Link>
                    <Link to="/farmer-bookings" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-700">
                      My Rentals
                    </Link>
                  </>
                )}

                {user.role === 'owner' && (
                  <>
                    <Link to="/owner-dashboard" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-700">
                      Owner Dashboard
                    </Link>
                    <Link to="/my-equipment" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-700">
                      My Fleet
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <Link to="/admin-dashboard" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-700">
                    Admin Portal
                  </Link>
                )}

                <Link to="/notifications" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-700 flex justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-extrabold">{unreadCount}</span>}
                </Link>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-700">
                  Profile Details
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-bold text-red-650 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-4 flex flex-col space-y-2 border-t border-gray-100 mt-2 px-3">
                <Link to="/login" className="text-center w-full text-gray-650 hover:text-primary-700 font-bold py-2 rounded-lg border border-gray-200">
                  Login
                </Link>
                <Link to="/register" className="text-center w-full bg-primary-600 text-white font-extrabold py-2.5 rounded-xl">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
