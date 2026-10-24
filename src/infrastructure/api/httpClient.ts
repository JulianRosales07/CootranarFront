import axios from 'axios';
import { descifrarDataRecursivo } from '../../shared/utils/cryptoRsa';
import { isTokenExpired, clearAuthStorage } from '../../shared/utils/authUtils';

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

let isRedirecting = false;

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  const url = config.url || '';
  const isLoginUrl = url.includes('/auth/login') || url.includes('/login');

  if (token && !isLoginUrl) {
    if (isTokenExpired(token)) {
      console.warn('⚠️ Token JWT expirado antes de enviar petición. Limpiando sesión...');
      clearAuthStorage();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(new axios.Cancel('Sesión expirada'));
    }

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
  async (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = error.config?.url;
    let data = error.response?.data;

    // Intentar descifrar data si viene cifrado
    if (data) {
      try {
        data = await descifrarDataRecursivo(data);
      } catch {
        // Mantener data tal como está si falla
      }
    }

    console.error(`[HTTP Error] ${status} en ${url}`, data);

    if (status === 403) {
      console.warn('⚠️ Error 403: Sin permisos para este recurso.');
    }

    if (status === 401) {
      const msg = (data?.message || '').toLowerCase();
      const esLoginUrl = url?.includes('/auth/login') || url?.includes('/login');
      const isLoginPage = typeof window !== 'undefined' && window.location.pathname.includes('/login');
      const esPermisos = msg.includes('permiso') || msg.includes('autorizado') || msg.includes('rol') || msg.includes('acceso') || msg.includes('no tiene');

      console.log('[401 Debug] Mensaje:', msg);

      if (esPermisos) {
        console.warn('⚠️ Error 401: Sin permisos suficientes. No se cierra sesión.');
      } else if (!esLoginUrl) {
        // En cualquier petición protegida no autorizada (token expirado, inválido o ausente)
        console.warn('⚠️ Error 401: Sesión no válida o expirada. Redirigiendo a Login...');
        clearAuthStorage();

        if (!isLoginPage && !isRedirecting) {
          isRedirecting = true;
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
