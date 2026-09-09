import axios from 'axios';

// Dynamically determine the backend host based on environment and access URL
const getBaseURL = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    envUrl = envUrl.trim().replace(/\/+$/, '');
    if (!envUrl.endsWith('/api')) {
      envUrl = `${envUrl}/api`;
    }
    return envUrl;
  }

  // In production, when served by Express or on same origin, default to relative '/api'
  if (import.meta.env.PROD) {
    return '/api';
  }

  // Development: If accessed via local network IP (e.g. 192.168.x.x)
  const hostname = window.location.hostname;
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:5001/api`;
  }

  return 'http://localhost:5001/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
});

// Interceptor to inject bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
