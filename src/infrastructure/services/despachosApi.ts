import { httpClient } from '../api/httpClient';

export const despachosApi = {
  obtenerTodos: (params: Record<string, unknown> = {}) =>
    httpClient.get('/despachos', { params }),

  crear: (data: Record<string, unknown>) =>
    httpClient.post('/despachos', data),

  confirmarSalida: (id: string) =>
    httpClient.patch(`/despachos/${id}/salida`, {}),

  confirmarLlegada: (id: string) =>
    httpClient.patch(`/despachos/${id}/llegada`, {}),
};
