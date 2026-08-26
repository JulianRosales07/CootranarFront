import { httpClient } from '../api/httpClient';

export const metodosPagoApiService = {
  obtenerTodos: () => {
    return httpClient.get('/metodos-pago');
  },

  obtenerActivos: () => {
    return httpClient.get('/metodos-pago');
  },
};

export default metodosPagoApiService;

