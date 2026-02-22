import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Attach JWT to every request automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear session and redirect to login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;

// ─── Auth ────────────────────────────────────────────────────────────────────
export const register = (data) => client.post('/auth/register', data);
export const login    = (data) => client.post('/auth/login', data);
export const getMe    = ()     => client.get('/auth/me');

// ─── Track ───────────────────────────────────────────────────────────────────
export const track = (feature_name) =>
  client.post('/track', { feature_name, timestamp: new Date().toISOString() });

// ─── Analytics ───────────────────────────────────────────────────────────────
export const getAnalytics = (params) => client.get('/analytics', { params });
