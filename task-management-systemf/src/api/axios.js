import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import { useToastStore } from '../store/toast.store';
import { router } from '../router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/v1' : 'http://localhost:8080/v1'), // Backend base URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    // We can also get the token from the store directly to be safer than localStorage
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      useToastStore.getState().addToast({ type: 'error', message: 'Request timed out. Check your connection.' });
    }
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      useAuthStore.getState().logout();
      if (currentPath !== '/login' && currentPath !== '/register') {
        useToastStore.getState().addToast({ type: 'warning', message: 'Session expired. Please log in again.' });
        router.navigate('/login', { state: { from: currentPath }, replace: true });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
