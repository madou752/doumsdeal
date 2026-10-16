import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('token');
  // Ancien format (email:mot de passe en base64) : on l'efface, l'utilisateur se reconnecte une fois
  if (token?.startsWith('Basic ')) {
    localStorage.removeItem('token');
    token = null;
  }
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default api;