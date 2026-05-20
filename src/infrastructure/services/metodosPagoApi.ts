import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const metodosPagoApi = axios.create({
  baseURL: `${API_URL}/metodos-pago`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante: permite enviar cookies
});

// Interceptor para agregar token (por si acaso se usa token en header)
metodosPagoApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null' && token !== 'cookie-based-auth') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const metodosPagoApiService = {
  obtenerTodos: () => {
    return metodosPagoApi.get('/');
  },

  obtenerActivos: () => {
    return metodosPagoApi.get('/');
  },
};

export default metodosPagoApiService;
