import { httpClient } from '../api/httpClient';

export const encomiendasApi = {
  cotizar: (data: Record<string, unknown>) =>
    httpClient.post('/encomiendas/cotizar', data),

  crearPreinscripcion: (data: Record<string, unknown>) =>
    httpClient.post('/encomiendas/preinscripcion', data),

  buscarPorReferencia: (referencia: string) =>
    httpClient.get(`/encomiendas/referencia/${encodeURIComponent(referencia)}`),

  registrar: (data: Record<string, unknown>) =>
    httpClient.post('/encomiendas/registrar', data),

  cambiarEstado: (id: string, data: Record<string, unknown>) =>
    httpClient.patch(`/encomiendas/${id}/estado`, data),

  obtenerTodas: (params: Record<string, unknown> = {}) =>
    httpClient.get('/encomiendas', { params }),

  obtenerPorId: (id: string) =>
    httpClient.get(`/encomiendas/${id}`),

  eliminar: (id: string) =>
    httpClient.delete(`/encomiendas/${id}`),
};
