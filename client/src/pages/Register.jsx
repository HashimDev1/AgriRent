import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'farmer',
    cnicNumber: '',
    address: '',
    longitude: '73.0844', // Islamabad default
    latitude: '33.6844',
  });

  const [localLoading, setLocalLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Extract initial role selection from URL queries
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'farmer' || roleParam === 'owner') {
      setFormData((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
    setError(null);
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
      },
      (error) => {
        alert('Failed to access GPS. Check location settings.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, phone, role, cnicNumber, address } = formData;

    if (!name || !email || !password || !phone || !address) {
      setValidationError('Please fill in name, email, password, phone, and address.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    if (role === 'owner' && !cnicNumber) {
      setValidationError('CNIC number is required for equipment owners to verify identity.');
      return;
    }

    setLocalLoading(true);
    try {
      const user = await register({
        ...formData,
        longitude: parseFloat(formData.longitude),
        latitude: parseFloat(formData.latitude),
      });

      if (user.role === 'owner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/farmer-dashboard');
      }
    } catch (err) {
      // Handled by AuthContext error state
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-md">
        
        {/* Title */}
        <div className="text-center">
          <span className="text-4xl">🌾</span>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
          <p className="mt-1.5 text-xs text-gray-500">
            Sign up to rent farm machinery or list your fleet online.
          </p>
        </div>

        {/* Error Panels */}
        {(validationError || error) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs text-red-700">
            {validationError || error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4 text-sm" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Muhammad Hashim"
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="hashim@domain.com"
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Password *</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Phone Number *</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="03214567890"
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">User Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
              >
                <option value="farmer">Farmer / Renter 🌾</option>
                <option value="owner">Equipment Owner 🚜</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">
                CNIC Number {formData.role === 'owner' ? '*' : '(Optional)'}
              </label>
              <input
                type="text"
                name="cnicNumber"
                required={formData.role === 'owner'}
                value={formData.cnicNumber}
                onChange={handleChange}
                placeholder="e.g. 35202-1234567-1"
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-bold block mb-1">Physical Address *</label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Village 123-EB, Arifwala"
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
            />
          </div>

          {/* Location Coordinates */}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400 font-bold">Location Coordinates</label>
              <button
                type="button"
                onClick={getGPSLocation}
                className="text-xs text-primary-600 font-bold hover:underline"
              >
                🛰️ Fetch My Location (GPS)
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

          <button
            type="submit"
            disabled={localLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center"
          >
            {localLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-primary-600 hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
