import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setValidationError('Please enter both email and password.');
      return;
    }

    setLocalLoading(true);
    try {
      const user = await login(email, password);
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'owner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/farmer-dashboard');
      }
    } catch (err) {
      // Handled by AuthContext state
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-md">
        
        {/* Title */}
        <div className="text-center">
          <span className="text-4xl">🌾</span>
          <h2 className="mt-3 text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage bookings or list machinery.
          </p>
        </div>

        {/* Error Panels */}
        {(validationError || error) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs text-red-700">
            {validationError || error}
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-xs text-gray-400 font-bold block mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="farmer@agrirent.com"
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50/50"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-xs text-gray-400 font-bold block mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={localLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
          >
            {localLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100 text-xs text-gray-500">
          <span>New to AgriRent? </span>
          <Link to="/register" className="font-bold text-primary-600 hover:underline">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
