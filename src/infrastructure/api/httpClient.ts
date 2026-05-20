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
    console.log('[HTTP Error] Config:', error.config);
    console.log('[HTTP Error] Headers:', error.config?.headers);

    if (status === 403) {
      console.warn('⚠️ Error 403: Sin permisos para este recurso.');
    }

    if (status === 401) {
      const msg = (data?.message || '').toLowerCase();
      const esPermisos = msg.includes('permiso') || msg.includes('autorizado') || msg.includes('rol') || msg.includes('acceso') || msg.includes('no tiene');

      console.log('[401 Debug] Mensaje:', msg);
      console.log('[401 Debug] Es permisos:', esPermisos);
      console.log('[401 Debug] Token:', localStorage.getItem('authToken'));
      console.log('[401 Debug] Path:', window.location.pathname);
      console.log('[401 Debug] Has Authorization header:', !!error.config?.headers?.Authorization);

      if (esPermisos) {
        console.warn('⚠️ Error 401: Sin permisos suficientes. No se cierra sesión.');
      } else {
        // Verificar si hay un token válido guardado; si no lo hay, no redirigir (evita loops)
        const token = localStorage.getItem('authToken');
        const isLoginPage = window.location.pathname.includes('/login');
        
        // Solo cerrar sesión si:
        // 1. Hay un token guardado
        // 2. No estamos en la página de login
        // 3. El error viene de una petición autenticada (no de páginas públicas)
        if (token && token !== 'cookie-based-auth' && !isLoginPage && error.config?.headers?.Authorization) {
          console.warn('⚠️ Error 401: Token inválido o expirado. Redirigiendo a Login...');
          localStorage.removeItem('authToken');
          localStorage.removeItem('usuario');
          window.location.href = '/login';
        } else {
          console.log('[401 Debug] No se cierra sesión porque no cumple condiciones');
        }
      }
    }
    return Promise.reject(error);
  }
);
