import axios from 'axios';

// Solana Gateway API base URL (use .env VITE_API_URL or default to production)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crypto-merchant-api.globpay.ai';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  withCredentials: false
});

// Use API key (from login) as Bearer token for dashboard endpoints
api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('merchant_token');
  if (apiKey && !config.url.includes('/api/merchants/login')) {
    config.headers.Authorization = `Bearer ${apiKey}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('merchant_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
