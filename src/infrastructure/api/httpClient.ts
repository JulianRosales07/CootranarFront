import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Permite enviar y recibir cookies
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  // Solo agregar el header Authorization si hay un token real (no el marcador de cookies)
  if (token && token !== 'undefined' && token !== 'null' && token !== 'cookie-based-auth' && token.trim() !== '') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const data = error.response?.data;

    console.error(`[HTTP Error] ${status} en ${url}`, data);

    if (status === 403) {
      console.warn('⚠️ Error 403: Sin permisos para este recurso.');
    }

    if (status === 401) {
      const msg = (data?.message || '').toLowerCase();
      const esPermisos = msg.includes('permiso') || msg.includes('autorizado') || msg.includes('rol') || msg.includes('acceso') || msg.includes('no tiene');

      if (esPermisos) {
        console.warn('⚠️ Error 401: Sin permisos suficientes. No se cierra sesión.');
      } else {
        // Verificar si hay un token válido guardado; si no lo hay, no redirigir (evita loops)
        const token = localStorage.getItem('authToken');
        if (token && token !== 'cookie-based-auth') {
          console.warn('⚠️ Error 401: Token inválido o expirado. Redirigiendo a Login...');
          localStorage.removeItem('authToken');
          localStorage.removeItem('usuario');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);
