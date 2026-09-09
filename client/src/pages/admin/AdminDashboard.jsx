import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import DashboardCard from '../../components/DashboardCard';
import MobileBackButton from '../../components/MobileBackButton';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

const AdminDashboard = () => {

  const [metrics, setMetrics] = useState({});
  const [users, setUsers] = useState([]);
  const [pendingEquipment, setPendingEquipment] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  // Category management states
  const [adminCategories, setAdminCategories] = useState([]);
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryLabel, setCategoryLabel] = useState('');
  const [categorySubtitle, setCategorySubtitle] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [remarks, setRemarks] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [dashRes, usersRes, equipRes, disputeRes, catRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/users'),
        API.get('/admin/equipment/pending'),
        API.get('/admin/disputes'),
        API.get('/categories'),
      ]);

      setMetrics(dashRes.data.metrics || {});
      setUsers(usersRes.data);
      setPendingEquipment(equipRes.data);
      setDisputes(disputeRes.data);
      setAdminCategories(catRes.data);
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

  const handleAddCategoryClick = () => {
    setSelectedCategory(null);
    setCategoryLabel('');
    setCategorySubtitle('');
    setCategoryIcon('🚜');
    setCategoryImagePreview('');
    setCategoryImageFile(null);
    setEditCategoryModalOpen(true);
  };

  const handleEditCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setCategoryLabel(cat.label);
    setCategorySubtitle(cat.subtitle || '');
    setCategoryIcon(cat.icon || '');
    setCategoryImagePreview(typeof cat.img === 'object' && cat.img ? cat.img.url : cat.img);
    setCategoryImageFile(null);
    setEditCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setEditCategoryModalOpen(false);
    setSelectedCategory(null);
    setCategoryLabel('');
    setCategorySubtitle('');
    setCategoryIcon('');
    setCategoryImagePreview('');
    setCategoryImageFile(null);
  };

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setCategoryImageFile(file);
      setCategoryImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCategoryUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory && !categoryImageFile) {
      alert('Please select an image file for the new category.');
      return;
    }

    setCategoryLoading(true);
    try {
      const data = new FormData();
      data.append('label', categoryLabel);
      data.append('subtitle', categorySubtitle);
      data.append('icon', categoryIcon);
      if (categoryImageFile) {
        data.append('img', categoryImageFile);
      }

      if (selectedCategory) {
        await API.put(`/admin/categories/${selectedCategory._id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Category updated successfully!');
      } else {
        await API.post('/admin/categories', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Category created successfully!');
      }

      handleCloseCategoryModal();
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All equipment under this category will no longer have a matching dynamic category.')) {
      return;
    }
    try {
      await API.delete(`/admin/categories/${id}`);
      alert('Category deleted successfully!');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
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
        <MobileBackButton />
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
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'categories'
                ? 'border-primary-600 text-primary-700 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-primary-600'
            }`}
          >
            Manage Categories ({adminCategories.length})
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

          {/* TAB 4: Categories management */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-extrabold text-gray-800 text-base">Fleet Machinery Categories</h3>
                <button
                  onClick={handleAddCategoryClick}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-2 px-4 rounded-xl text-xs flex items-center space-x-1 transition-colors shadow-2xs"
                >
                  <span>➕ Add New Category</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="p-3">Category info</th>
                      <th className="p-3">Icon</th>
                      <th className="p-3">Subtitle</th>
                      <th className="p-3">Image Preview</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {adminCategories.map((c) => {
                      const url = typeof c.img === 'object' && c.img ? c.img.url : c.img;
                      return (
                        <tr key={c._id} className="hover:bg-gray-50/50">
                           <td className="p-3 font-bold text-gray-850 capitalize">
                            {c.label} <span className="block text-[10px] text-gray-400 font-bold">Value: {c.value}</span>
                          </td>
                          <td className="p-3 text-base">{c.icon || '🚜'}</td>
                          <td className="p-3 text-gray-600 font-medium">{c.subtitle || 'N/A'}</td>
                          <td className="p-3">
                            <img src={url} alt="" className="w-14 h-10 object-cover rounded-lg border border-gray-150" />
                          </td>
                          <td className="p-3 text-center space-x-2">
                            <button
                              onClick={() => handleEditCategoryClick(c)}
                              className="bg-primary-50 hover:bg-primary-100 text-primary-600 hover:text-primary-700 font-bold py-1.5 px-3 rounded-lg text-[10px]"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c._id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-bold py-1.5 px-3 rounded-lg text-[10px]"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Category Edit Modal */}
        <Modal
          isOpen={editCategoryModalOpen}
          onClose={handleCloseCategoryModal}
          title={selectedCategory ? "Edit Machinery Category Details ⚙️" : "Add New Fleet Category 🚜"}
        >
          <form onSubmit={handleCategoryUpdateSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] text-gray-400 font-bold block mb-1">Category Label *</label>
              <input
                type="text"
                required
                value={categoryLabel}
                onChange={(e) => setCategoryLabel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold block mb-1">Category Subtitle *</label>
              <input
                type="text"
                required
                value={categorySubtitle}
                onChange={(e) => setCategorySubtitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold block mb-1">Category Emoji Icon *</label>
              <input
                type="text"
                required
                value={categoryIcon}
                onChange={(e) => setCategoryIcon(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold block mb-1">Category Image File</label>
              <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50 cursor-pointer relative min-h-[120px] hover:bg-gray-100/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {categoryImagePreview ? (
                  <img src={categoryImagePreview} alt="Category Image Preview" className="w-full h-24 object-contain rounded-md" />
                ) : (
                  <>
                    <span className="text-xl">📸</span>
                    <span className="text-[10px] text-gray-500 font-bold mt-1 text-center">Upload new category photo</span>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={categoryLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-2.5 rounded-lg transition-colors flex items-center justify-center"
            >
              {categoryLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>Save Category Changes</span>
              )}
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default AdminDashboard;
