import axios from 'axios';

const API = axios.create({
  baseURL: 'https://marketa-mu-project.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('marketa_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('marketa_token');
      localStorage.removeItem('marketa_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
