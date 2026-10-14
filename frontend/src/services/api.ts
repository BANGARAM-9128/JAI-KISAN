import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jai_kisan_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-clear on /auth/me checks if offline
      const currentUrl = error.config?.url || '';
      if (!currentUrl.includes('/auth/me')) {
        localStorage.removeItem('jai_kisan_token');
      }
    }
    return Promise.reject(error);
  }
);
