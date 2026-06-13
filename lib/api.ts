import axios from 'axios';
import { useAppStore } from '@/store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAppStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAppStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const getAssetUrl = (path: string | null | undefined) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '');
  return baseUrl + path;
};

export default api;
