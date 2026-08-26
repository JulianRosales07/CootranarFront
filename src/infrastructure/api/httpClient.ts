import axios from 'axios';
import { descifrarDataRecursivo } from '../../shared/utils/cryptoRsa';

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
  async (response) => {
    if (response.data) {
      response.data = await descifrarDataRecursivo(response.data);
    }
    return response;
  },
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
      const esTokenExpirado = msg.includes('expirado') || msg.includes('expired') || msg.includes('malformed') || msg.includes('jwt') || msg.includes('token inválido') || msg.includes('token invalido');
      const esPermisos = msg.includes('permiso') || msg.includes('autorizado') || msg.includes('rol') || msg.includes('acceso') || msg.includes('no tiene');

      console.log('[401 Debug] Mensaje:', msg);
      console.log('[401 Debug] Es token expirado:', esTokenExpirado);

      if (esPermisos) {
        console.warn('⚠️ Error 401: Sin permisos suficientes. No se cierra sesión.');
      } else if (esTokenExpirado) {
        const token = localStorage.getItem('authToken');
        const isLoginPage = window.location.pathname.includes('/login');
        
        if (token && token !== 'cookie-based-auth' && !isLoginPage) {
          console.warn('⚠️ Error 401: Token expirado/inválido confirmado. Redirigiendo a Login...');
          localStorage.removeItem('authToken');
          localStorage.removeItem('usuario');
          window.location.href = '/login';
        }
      } else {
        console.warn('⚠️ Error 401 puntual en petición. No se cierra sesión automáticamente:', url);
      }
    }
    return Promise.reject(error);
  }
);
