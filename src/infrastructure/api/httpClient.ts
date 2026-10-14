import axios from 'axios';
import { descifrarDataRecursivo } from '../../shared/utils/cryptoRsa';

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return '/api';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
};

export const API_BASE_URL = getApiBaseUrl();

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
    if (config.headers && typeof (config.headers as any).set === 'function') {
      (config.headers as any).set('Authorization', `Bearer ${token}`);
    } else {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
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
      const esPermisos = msg.includes('permiso') || msg.includes('autorizado') || msg.includes('rol') || msg.includes('acceso') || msg.includes('no tiene');
      const esExpiradoClaro = msg.includes('expirado') || msg.includes('expired') || msg.includes('jwt') || msg.includes('inválido') || msg.includes('invalido');

      console.log('[401 Debug] Mensaje:', msg);

      if (esPermisos) {
        console.warn('⚠️ Error 401: Sin permisos suficientes. No se cierra sesión.');
      } else {
        const token = localStorage.getItem('authToken');
        const isLoginPage = window.location.pathname.includes('/login');

        // Evitar bucle de redirección inmediata al loguear si aún se usa cookie-based-auth sin expiración clara
        if (token && !isLoginPage && (esExpiradoClaro || (token !== 'cookie-based-auth' && token.trim() !== ''))) {
          console.warn('⚠️ Error 401: Sesión no válida o expirada. Redirigiendo a Login...');
          localStorage.removeItem('authToken');
          localStorage.removeItem('usuario');
          window.location.href = '/login';
        } else {
          console.warn('⚠️ Error 401 puntual en petición:', url);
        }
      }
    }
    return Promise.reject(error);
  }
);
