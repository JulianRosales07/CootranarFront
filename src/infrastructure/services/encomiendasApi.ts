import { httpClient } from '../api/httpClient';

export const encomiendasApi = {
  obtenerTodas: (params: Record<string, unknown> = {}) =>
    httpClient.get('/encomiendas', { params }),

  obtenerPorEstado: (estado: string, params: Record<string, unknown> = {}) =>
    httpClient.get('/encomiendas', { params: { estado, ...params } }),

  obtenerPorId: (id: string) =>
    httpClient.get(`/encomiendas/${id}`),

  buscarPorReferencia: (referencia: string) =>
    httpClient.get(`/encomiendas/referencia/${encodeURIComponent(referencia)}`),

  crear: (data: Record<string, unknown>) =>
    httpClient.post('/encomiendas', data),

  actualizar: (id: string, data: Record<string, unknown>) =>
    httpClient.put(`/encomiendas/${id}`, data),

  actualizarEstado: (id: string, estado: string) =>
    httpClient.patch(`/encomiendas/${id}/estado`, { estado }),

  eliminar: (id: string) =>
    httpClient.delete(`/encomiendas/${id}`),
};
