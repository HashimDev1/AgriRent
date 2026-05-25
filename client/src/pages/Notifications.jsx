import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex bg-gray-50/50 min-h-screen">
      <Sidebar role="farmer" /> {/* sidebar adjusts to local preferences, defaults to farmer/user links */}

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-4xl mx-auto overflow-hidden bg-white border-l border-gray-200">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-5">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Notification Alerts Inbox 🔔</h2>
            <p className="text-gray-500 text-sm mt-1">
              You have {unreadCount} unread system notifications.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold px-4 py-2.5 rounded-lg text-xs border border-primary-200 hover:border-primary-300 transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16 p-8 space-y-4">
            <span className="text-5xl block">🔔</span>
            <h3 className="font-extrabold text-gray-700 text-lg">Inbox is Empty</h3>
            <p className="text-gray-400 text-xs max-w-xs mx-auto">
              We will notify you here when owners approve your booking request, or when payments are verified.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-4 rounded-xl border flex justify-between items-start transition-all ${
                  n.isRead
                    ? 'bg-gray-50/40 border-gray-150 text-gray-500'
                    : 'bg-primary-50/20 border-primary-100 text-gray-800 shadow-3xs'
                }`}
              >
                <div className="space-y-1 text-xs">
                  <span className={`font-bold block text-sm ${n.isRead ? 'text-gray-700' : 'text-[#135c2f]'}`}>
                    {n.title}
                  </span>
                  <p className="leading-relaxed font-medium">{n.message}</p>
                  <span className="text-[10px] text-gray-400 block pt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="text-[10px] bg-white border border-gray-200 text-primary-700 font-bold py-1 px-2.5 rounded-md shadow-2xs hover:bg-primary-50"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default Notifications;
