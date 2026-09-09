import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, phone, newPassword, confirmPassword } = formData;

    if (!email || !phone || !newPassword || !confirmPassword) {
      setError('Please fill in all the fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/auth/forgot-password', {
        email: email.trim(),
        phone: phone.trim(),
        newPassword,
      });

      setSuccess(response.data?.message || 'Password reset successfully!');
      setFormData({
        email: '',
        phone: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Verify email and phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-md">
        
        {/* Title */}
        <div className="text-center">
          <span className="text-4xl">🔑</span>
          <h2 className="mt-3 text-3xl font-extrabold text-gray-900 tracking-tight">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-500">
            Confirm your registered email and phone number to set a new password.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs text-red-700 font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg text-xs text-green-700 font-semibold">
            {success} Redirecting to login page...
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs text-gray-400 font-bold block mb-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. farmer@agrirent.com"
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-bold block mb-1">
              Registered Phone Number
            </label>
            <input
              name="phone"
              type="text"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 03001234567"
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-bold block mb-1">
              New Password
            </label>
            <input
              name="newPassword"
              type="password"
              required
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-bold block mb-1">
              Confirm New Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2 disabled:bg-gray-400"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100 text-xs text-gray-500">
          <Link to="/login" className="font-bold text-primary-600 hover:underline">
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
