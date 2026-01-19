import axios from 'axios';

const api = axios.create({
  // Automatically switches between your live Render server and your local machine
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://crytotrade-pro-0exo.onrender.com/api', // FIXED: Pointing to new backend
});

// Automatically add JWT token to headers if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;