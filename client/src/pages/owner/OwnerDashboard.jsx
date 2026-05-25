import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import DashboardCard from '../../components/DashboardCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const OwnerDashboard = () => {
  const { user } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [bookingsRes, equipRes, payRes] = await Promise.all([
          API.get('/bookings/owner'),
          API.get('/equipment/owner/my-equipment'),
          API.get('/payments/owner'),
        ]);

        setBookings(bookingsRes.data);
        setEquipment(equipRes.data);
        setPayments(payRes.data);
      } catch (err) {
        console.error('Failed to load owner dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await API.put(`/bookings/${id}/approve`);
      alert('Booking approved successfully!');
      // refresh
      const bookingsRes = await API.get('/bookings/owner');
      setBookings(bookingsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve booking.');
    }
  };

  const handleReject = async (id, message) => {
    try {
      await API.put(`/bookings/${id}/reject`, { message });
      alert('Booking rejected successfully!');
      // refresh
      const bookingsRes = await API.get('/bookings/owner');
      setBookings(bookingsRes.data);
    } catch (err) {
      alert('Failed to reject booking.');
    }
  };

  // Metrics
  const fleetCount = equipment.length;
  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const activeRentalsCount = bookings.filter((b) => b.status === 'active').length;
  const completedBookingsCount = bookings.filter((b) => b.status === 'completed').length;
  
  // Calculate total earnings from payments marked as paid
  const totalEarnings = payments
    .filter((p) => p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50/50 min-h-screen">
      <Sidebar role="owner" />

      <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto overflow-hidden">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Fleet Center, {user?.name} 🚜</h2>
            <p className="text-gray-500 text-sm mt-1">Manage listings and view booking requests.</p>
          </div>
          <Link
            to="/add-equipment"
            className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-5 py-3 rounded-xl text-sm transition-all shadow-sm flex items-center space-x-2"
          >
            <span>+ Add New Equipment</span>
          </Link>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <DashboardCard title="My Fleet" value={fleetCount} icon="🚜" color="primary" />
          <DashboardCard title="Pending Requests" value={pendingRequests.length} icon="⌛" color="amber" />
          <DashboardCard title="Active Rentals" value={activeRentalsCount} icon="🚚" color="blue" />
          <DashboardCard title="Completed Rentals" value={completedBookingsCount} icon="✓" color="earth" />
          <DashboardCard title="Total Earnings" value={`PKR ${totalEarnings}`} icon="💰" color="purple" />
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-2xl border border-gray-150 shadow-3xs p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-gray-800 text-base">Recent Booking Requests</h3>
            <Link to="/owner-bookings" className="text-xs text-primary-600 font-bold hover:underline">
              View All requests
            </Link>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              No pending booking requests. List more machinery to boost visibility!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="p-3">Machinery</th>
                    <th className="p-3">Renter</th>
                    <th className="p-3">Dates</th>
                    <th className="p-3">Rent / Deposit</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingRequests.slice(0, 5).map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-bold text-gray-800">{b.equipmentId?.title}</td>
                      <td className="p-3 text-gray-600">
                        {b.renterId?.name} <span className="block text-[10px] text-gray-400">{b.renterId?.phone}</span>
                      </td>
                      <td className="p-3 text-gray-600">
                        {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                        <span className="block text-[10px] text-gray-400">{b.totalDays} Days</span>
                      </td>
                      <td className="p-3 text-gray-600">
                        PKR {b.rentPerDay} / day
                        <span className="block text-[10px] text-gray-400">Deposit: PKR {b.equipmentId?.securityDeposit || 0}</span>
                      </td>
                      <td className="p-3 font-bold text-primary-700">PKR {b.totalAmount}</td>
                      <td className="p-3 flex justify-center space-x-2">
                        <button
                          onClick={() => handleApprove(b._id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-lg text-[10px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Please enter rejection reason:');
                            if (reason !== null) {
                              handleReject(b._id, reason);
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1 px-3 rounded-lg text-[10px]"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;
