import React, { useEffect, useState, useContext } from 'react';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import DashboardCard from '../../components/DashboardCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  const [metrics, setMetrics] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingEquipment, setPendingEquipment] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const [remarks, setRemarks] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [dashRes, usersRes, equipRes, disputeRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/users'),
        API.get('/admin/equipment/pending'),
        API.get('/admin/disputes'),
      ]);

      setMetrics(dashRes.data.metrics || {});
      setRevenue(dashRes.data.monthlyRevenue || []);
      setCategories(dashRes.data.mostRentedCategories || []);
      setUsers(usersRes.data);
      setPendingEquipment(equipRes.data);
      setDisputes(disputeRes.data);
    } catch (err) {
      console.error('Failed to load admin panel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // User verify toggle
  const handleVerifyUser = async (id) => {
    try {
      await API.put(`/admin/users/${id}/verify`);
      alert('User verification state changed.');
      fetchDashboardData();
    } catch (err) {
      alert('Failed to modify user verification.');
    }
  };

  // User block toggle
  const handleBlockUser = async (id) => {
    try {
      await API.put(`/admin/users/${id}/block`);
      alert('User block state changed.');
      fetchDashboardData();
    } catch (err) {
      alert('Failed to modify user block status.');
    }
  };

  // Approve equipment
  const handleApproveEquipment = async (id) => {
    try {
      await API.put(`/admin/equipment/${id}/approve`);
      alert('Machinery listing approved!');
      fetchDashboardData();
    } catch (err) {
      alert('Failed to approve machinery.');
    }
  };

  // Reject equipment
  const handleRejectEquipment = async (id) => {
    const msg = prompt('Enter rejection reason:');
    if (msg === null) return;
    try {
      await API.put(`/admin/equipment/${id}/reject`, { message: msg });
      alert('Machinery listing rejected!');
      fetchDashboardData();
    } catch (err) {
      alert('Failed to reject machinery.');
    }
  };

  // Resolve dispute
  const handleResolveDispute = async (id, status) => {
    if (!remarks) {
      alert('Please fill in resolution remarks first!');
      return;
    }
    try {
      await API.put(`/admin/disputes/${id}/resolve`, { adminRemarks: remarks, status });
      alert(`Dispute set as ${status}!`);
      setRemarks('');
      fetchDashboardData();
    } catch (err) {
      alert('Failed to resolve dispute.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50/50 min-h-screen">
      <Sidebar role="admin" />

      <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto overflow-hidden">
        {/* Header banner */}
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Admin Operations Command 🛡️</h2>
          <p className="text-gray-500 text-sm mt-1">Review user accounts, verify heavy machinery, and handle disputes.</p>
        </div>

        {/* Aggregate statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <DashboardCard title="Total Farmers" value={metrics.totalFarmers || 0} icon="👥" color="primary" />
          <DashboardCard title="Total Owners" value={metrics.totalOwners || 0} icon="🚜" color="earth" />
          <DashboardCard title="Pending Approvals" value={metrics.pendingEquipment || 0} icon="⌛" color="amber" />
          <DashboardCard title="Open Disputes" value={metrics.openDisputes || 0} icon="⚖️" color="red" />
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'users'
                ? 'border-primary-600 text-primary-700 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-primary-600'
            }`}
          >
            Manage Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'equipment'
                ? 'border-primary-600 text-primary-700 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-primary-600'
            }`}
          >
            Verify Listings ({pendingEquipment.length})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'disputes'
                ? 'border-primary-600 text-primary-700 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-primary-600'
            }`}
          >
            Resolve Disputes ({disputes.length})
          </button>
        </div>

        {/* Tab content wrapper */}
        <div className="bg-white rounded-2xl border border-gray-150 shadow-3xs p-6">
          
          {/* TAB 1: User management */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-gray-800 text-base mb-2">Registered Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="p-3">User info</th>
                      <th className="p-3">CNIC Number</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Verified Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-gray-800">
                          {u.name} <span className="block text-[10px] text-gray-400 font-semibold">{u.email}</span>
                        </td>
                        <td className="p-3 text-gray-600">{u.cnicNumber || 'N/A'}</td>
                        <td className="p-3 text-gray-600">{u.phone}</td>
                        <td className="p-3 uppercase text-gray-500 font-bold">{u.role}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            {u.isVerified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </td>
                        <td className="p-3 flex justify-center space-x-2">
                          <button
                            onClick={() => handleVerifyUser(u._id)}
                            className="bg-gray-100 hover:bg-primary-50 text-gray-700 hover:text-primary-700 font-bold py-1 px-3 rounded-lg text-[10px]"
                          >
                            Toggle Verify
                          </button>
                          <button
                            onClick={() => handleBlockUser(u._id)}
                            className={`font-bold py-1 px-3 rounded-lg text-[10px] ${u.isBlocked ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Equipment listings verification */}
          {activeTab === 'equipment' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-gray-800 text-base mb-2">Pending Equipment Approval Queue</h3>
              {pendingEquipment.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No new machinery listings pending verification.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="p-3">Equipment</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Daily Rent</th>
                        <th className="p-3">Owner Details</th>
                        <th className="p-3">City</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pendingEquipment.map((e) => (
                        <tr key={e._id} className="hover:bg-gray-50/50">
                          <td className="p-3 font-bold text-gray-800">
                            {e.title} <span className="block text-[10px] text-gray-400">{e.brand} ({e.model})</span>
                          </td>
                          <td className="p-3 uppercase text-gray-500 font-bold">{e.category}</td>
                          <td className="p-3 font-bold text-primary-700">PKR {e.rentPerDay}</td>
                          <td className="p-3 text-gray-600">
                            {e.ownerId?.name} <span className="block text-[10px] text-gray-400">{e.ownerId?.phone}</span>
                          </td>
                          <td className="p-3 capitalize text-gray-500">{e.location?.city}</td>
                          <td className="p-3 flex justify-center space-x-2">
                            <button
                              onClick={() => handleApproveEquipment(e._id)}
                              className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectEquipment(e._id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1.5 px-3 rounded-lg text-[10px]"
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
          )}

          {/* TAB 3: Disputes resolution */}
          {activeTab === 'disputes' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-gray-800 text-base mb-2">Logged Disputes</h3>
              {disputes.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No disputes reported on the system.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Resolution Input field */}
                  <div className="border border-purple-100 p-3 rounded-lg bg-purple-50/20">
                    <label className="text-xs text-purple-700 font-bold block mb-1">Resolution / Remarks Form</label>
                    <textarea
                      placeholder="Write investigation details or notes here..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-purple-500 bg-white"
                      rows="2"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
                          <th className="p-3">Disputed booking</th>
                          <th className="p-3">Reason</th>
                          <th className="p-3">Filed By</th>
                          <th className="p-3">Against</th>
                          <th className="p-3">Description</th>
                          <th className="p-3">Remarks</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {disputes.map((d) => (
                          <tr key={d._id} className="hover:bg-gray-50/50">
                            <td className="p-3 font-bold text-gray-800">
                              #{d.bookingId?._id?.slice(-8)}
                              <span className="block text-[10px] text-gray-400">{d.equipmentId?.title}</span>
                            </td>
                            <td className="p-3 text-gray-600 font-semibold">{d.reason.replace('_', ' ')}</td>
                            <td className="p-3 font-bold text-gray-600">{d.createdBy?.name}</td>
                            <td className="p-3 text-gray-600">{d.againstUserId?.name}</td>
                            <td className="p-3 text-gray-400 max-w-[200px] truncate" title={d.description}>{d.description}</td>
                            <td className="p-3 text-gray-500 italic max-w-[150px] truncate" title={d.adminRemarks}>{d.adminRemarks || 'None'}</td>
                            <td className="p-3">
                              <StatusBadge status={d.status} />
                            </td>
                            <td className="p-3 flex justify-center space-x-2">
                              {d.status === 'open' || d.status === 'under_review' ? (
                                <>
                                  <button
                                    onClick={() => handleResolveDispute(d._id, 'resolved')}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2.5 rounded-lg text-[10px]"
                                  >
                                    Resolve
                                  </button>
                                  <button
                                    onClick={() => handleResolveDispute(d._id, 'rejected')}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1 px-2.5 rounded-lg text-[10px]"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-gray-400 font-semibold">Closed case</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
