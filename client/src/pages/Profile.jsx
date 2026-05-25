import React, { useState, useContext, useEffect } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, refreshUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profileImage: '',
    cnicNumber: '',
    address: '',
    longitude: '',
    latitude: '',
    password: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        cnicNumber: user.cnicNumber || '',
        address: user.address || '',
        longitude: user.location?.coordinates?.[0]?.toString() || '0',
        latitude: user.location?.coordinates?.[1]?.toString() || '0',
        password: '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const getGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Your browser does not support geolocation.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          longitude: position.coords.longitude.toFixed(6).toString(),
          latitude: position.coords.latitude.toFixed(6).toString(),
        }));
        setSuccess('Coordinates updated via GPS.');
      },
      (error) => {
        alert('Failed to access GPS. Check location settings.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    setSuccess('');

    try {
      await API.put('/users/profile', {
        ...formData,
        longitude: parseFloat(formData.longitude),
        latitude: parseFloat(formData.latitude),
      });

      await refreshUser(); // refresh AuthContext state
      setSuccess('Profile updated successfully!');
      setFormData((prev) => ({ ...prev, password: '' })); // clear password input
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setSubmitLoading(false);
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
      <Sidebar role={user?.role || 'farmer'} />

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-4xl mx-auto overflow-hidden bg-white border-l border-gray-200">
        
        {/* Title */}
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Profile Settings 👤</h2>
          <p className="text-gray-500 text-sm mt-1">
            Update your personal contact details, CNIC verification records, and address details.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg text-xs text-green-700 font-semibold">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Email (Immutable)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-gray-100 text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">CNIC Number</label>
              <input
                type="text"
                name="cnicNumber"
                value={formData.cnicNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-bold block mb-1">Profile Image URL</label>
            <input
              type="text"
              name="profileImage"
              value={formData.profileImage}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
              placeholder="Paste image link..."
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-bold block mb-1">Physical Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
              required
            />
          </div>

          {/* Location coordinates */}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400 font-bold">Coordinates Location</label>
              <button
                type="button"
                onClick={getGPSLocation}
                className="text-xs text-primary-600 font-bold hover:underline"
              >
                🛰️ Recalculate Coordinates (GPS)
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400">Longitude</label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Latitude</label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-bold block mb-1">
              New Password (Leave blank to keep current)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••"
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center"
          >
            {submitLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span>Save Changes</span>
            )}
          </button>

        </form>

      </main>
    </div>
  );
};

export default Profile;
