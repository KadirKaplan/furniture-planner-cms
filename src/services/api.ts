import axios from 'axios';

const baseURL = `${import.meta.env.VITE_API_URL}/api`;

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eyce_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith('/auth/');
    // Only force logout redirect for 401s on non-auth endpoints (expired/invalid session).
    // Login failures on /auth/login must propagate so the login page can show the error.
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('eyce_token');
      localStorage.removeItem('eyce_user');
      window.location.href = import.meta.env.BASE_URL + 'login';
    }
    return Promise.reject(error);
  }
);
