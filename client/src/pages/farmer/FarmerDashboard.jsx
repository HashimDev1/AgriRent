import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import DashboardCard from '../../components/DashboardCard';
import MobileBackButton from '../../components/MobileBackButton';
import EquipmentCard from '../../components/EquipmentCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const FarmerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [bookingsRes, recRes, notifRes] = await Promise.all([
          API.get('/bookings/farmer'),
          API.get('/equipment'),
          API.get('/notifications'),
        ]);

        setBookings(bookingsRes.data);
        // Take first 4 listings as recommendation
        setRecommended(recRes.data.slice(0, 4));
        // Take first 5 unread alerts
        setNotifications(notifRes.data.filter((n) => !n.isRead).slice(0, 5));
      } catch (err) {
        console.error('Failed to load farmer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/equipment?keyword=${searchQuery}`);
  };

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const activeCount = bookings.filter((b) => b.status === 'active').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const totalBookings = bookings.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50/50 min-h-screen">
      <Sidebar role="farmer" />

      <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto overflow-hidden">
        <MobileBackButton />
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#135c2f] to-[#15803d] p-6 md:p-8 rounded-2xl text-white shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold">Welcome back, {user?.name}! 👋</h2>
            <p className="text-[#dcfce7] text-sm">
              Verify your equipment requirements and coordinate bookings.
            </p>
          </div>
          <form onSubmit={handleSearchSubmit} className="flex bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-xl w-full md:w-auto md:min-w-[320px]">
            <input
              type="text"
              placeholder="Search machinery type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 outline-none text-sm text-white placeholder-white/60 flex-grow px-3 py-2"
            />
            <button type="submit" className="bg-white text-primary-900 px-4 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-primary-50">
              Search
            </button>
          </form>
        </div>

        {/* Aggregated Analytics Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard title="Total Rentals" value={totalBookings} icon="📅" color="primary" />
          <DashboardCard title="Pending Requests" value={pendingCount} icon="⌛" color="amber" />
          <DashboardCard title="Active Sessions" value={activeCount} icon="🚚" color="blue" />
          <DashboardCard title="Completed Runs" value={completedCount} icon="✓" color="earth" />
        </div>

        {/* Dynamic section: Bookings lists & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Notifications Inbox Overview */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-150 shadow-3xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-800 text-base">Unread Alerts 🔔</h3>
              <Link to="/notifications" className="text-xs text-primary-600 font-bold hover:underline">
                View All
              </Link>
            </div>
            
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">
                Inbox is empty. No new notifications!
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n._id} className="p-3 bg-gray-50 rounded-lg text-xs border border-gray-100 space-y-1">
                    <span className="font-bold text-gray-700 block">{n.title}</span>
                    <p className="text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats list / Active bookings overview */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-150 shadow-3xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-800 text-base">Current Rental Sessions 🚚</h3>
              <Link to="/farmer-bookings" className="text-xs text-primary-600 font-bold hover:underline">
                Manage Bookings
              </Link>
            </div>

            {bookings.filter((b) => b.status === 'active' || b.status === 'approved').length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                No active or approved rentals right now. <br />
                <Link to="/equipment" className="text-primary-600 font-bold hover:underline mt-2 inline-block">
                  Browse fleet catalogue
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {bookings
                  .filter((b) => b.status === 'active' || b.status === 'approved')
                  .slice(0, 3)
                  .map((b) => (
                    <div key={b._id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-gray-800 block text-sm">{b.equipmentId?.title}</span>
                        <span className="text-gray-400">
                          {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary-700 block">PKR {b.totalAmount}</span>
                        <span className="capitalize text-gray-400 font-semibold">{b.status}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>

        {/* Recommended Machinery */}
        <div className="space-y-4">
          <h3 className="text-xl font-extrabold text-gray-800 border-b border-gray-100 pb-3">Recommended For You 🌱</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended.map((item) => (
              <EquipmentCard key={item._id} equipment={item} />
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default FarmerDashboard;
