import React, { useState, useContext, useEffect } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import MobileBackButton from '../components/MobileBackButton';

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

  const [cnicFrontFile, setCnicFrontFile] = useState(null);
  const [cnicBackFile, setCnicBackFile] = useState(null);
  const [cnicFrontPreview, setCnicFrontPreview] = useState('');
  const [cnicBackPreview, setCnicBackPreview] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        profileImage: user.profileImage ? (user.profileImage.url || user.profileImage) : '',
        cnicNumber: user.cnicNumber || '',
        address: user.address || '',
        longitude: user.location?.coordinates?.[0]?.toString() || '0',
        latitude: user.location?.coordinates?.[1]?.toString() || '0',
        password: '',
      });
      setCnicFrontPreview(user.cnicFrontImage ? (user.cnicFrontImage.url || user.cnicFrontImage) : '');
      setCnicBackPreview(user.cnicBackImage ? (user.cnicBackImage.url || user.cnicBackImage) : '');
      setProfilePreview(user.profileImage ? (user.profileImage.url || user.profileImage) : '');
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleFrontFileChange = (e) => {
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
      setCnicFrontFile(file);
      setCnicFrontPreview(URL.createObjectURL(file));
      setError('');
      setSuccess('');
    }
  };

  const handleBackFileChange = (e) => {
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
      setCnicBackFile(file);
      setCnicBackPreview(URL.createObjectURL(file));
      setError('');
      setSuccess('');
    }
  };

  const handleProfileFileChange = (e) => {
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
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
      setError('');
      setSuccess('');
    }
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
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (cnicFrontFile) {
        data.append('cnicFrontImage', cnicFrontFile);
      }
      if (cnicBackFile) {
        data.append('cnicBackImage', cnicBackFile);
      }
      if (profileFile) {
        data.append('profileImage', profileFile);
      }

      await API.put('/users/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
        <MobileBackButton />
        
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
          
          {/* Profile Picture Upload Section */}
          <div className="flex flex-col items-center justify-center space-y-3 pb-6 border-b border-gray-100">
            <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105">
              <img
                src={profilePreview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-2xl text-white">📷</span>
                <span className="text-[10px] text-white font-bold mt-1 uppercase tracking-wider">Change Photo</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-500 font-bold block">Upload Profile Photo</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">JPG, PNG or GIF. Max size 5MB.</span>
            </div>
          </div>

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

          {/* CNIC Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">CNIC Front Image</label>
              <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50 cursor-pointer relative min-h-[120px] hover:bg-gray-100/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFrontFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {cnicFrontPreview ? (
                  <img src={cnicFrontPreview} alt="CNIC Front Preview" className="w-full h-24 object-contain rounded-md" />
                ) : (
                  <>
                    <span className="text-xl">💳</span>
                    <span className="text-[10px] text-gray-500 font-bold mt-1 text-center">Upload Front Side</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">CNIC Back Image</label>
              <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50 cursor-pointer relative min-h-[120px] hover:bg-gray-100/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {cnicBackPreview ? (
                  <img src={cnicBackPreview} alt="CNIC Back Preview" className="w-full h-24 object-contain rounded-md" />
                ) : (
                  <>
                    <span className="text-xl">💳</span>
                    <span className="text-[10px] text-gray-500 font-bold mt-1 text-center">Upload Back Side</span>
                  </>
                )}
              </div>
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
