import axios from 'axios';
import { useAuthStore } from '../stores/authStore.js';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status !== 401 || original._retry) throw err;
    original._retry = true;

    const { refreshToken: storedRefresh, user } = useAuthStore.getState();
    if (!storedRefresh) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      throw err;
    }

    try {
      if (!refreshing) {
        refreshing = api
          .post('/api/auth/refresh', { refreshToken: storedRefresh })
          .then(({ data }) => {
            useAuthStore.getState().login(user, data.accessToken, data.refreshToken);
            return data.accessToken;
          })
          .catch((refreshErr) => {
            useAuthStore.getState().logout();
            window.location.href = '/login';
            throw refreshErr;
          })
          .finally(() => { refreshing = null; });
      }

      const newToken = await refreshing;
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      throw err;
    }
  },
);

export default api;
