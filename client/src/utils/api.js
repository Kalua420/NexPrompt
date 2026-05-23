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
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      useAuthStore.getState().logout();
      throw err;
    }
    if (!refreshing) {
      refreshing = axios.create({ baseURL: api.defaults.baseURL }).post('/api/auth/refresh', { refreshToken }).then(({ data }) => {
        useAuthStore.getState().login(useAuthStore.getState().user, data.accessToken, data.refreshToken);
        return data.accessToken;
      }).catch(() => {
        useAuthStore.getState().logout();
        throw err;
      }).finally(() => { refreshing = null; });
    }
    const token = await refreshing;
    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
  },
);

export default api;
