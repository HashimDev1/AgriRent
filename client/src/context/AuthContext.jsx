import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user details on application startup
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Session restoration failed:', err.response?.data?.message || err.message);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      const { token, ...userData } = res.data;
      setUser(userData);
      return res.data;
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED'
          ? 'Server request timed out. Please try again.'
          : err.message || 'Invalid credentials or server unavailable.');
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (userData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await API.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      const { token, ...userData } = res.data;
      setUser(userData);
      return res.data;
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED'
          ? 'Registration timed out. Please try again.'
          : err.message || 'Registration failed. Please verify your details.');
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  // Refresh profile details in state
  const refreshUser = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to refresh user profile data:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
