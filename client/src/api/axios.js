import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Runs before EVERY request this axios instance makes
api.interceptors.request.use(
  (config) => {
    // Read token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // must return config or request won't proceed
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Runs after EVERY response comes back
api.interceptors.response.use(
  (response) => response, // if successful, just return it

  (error) => {
    // If server returns 401 (unauthorized), token is invalid/expired
    if (error.response?.status === 401) {
      // Clear everything and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;