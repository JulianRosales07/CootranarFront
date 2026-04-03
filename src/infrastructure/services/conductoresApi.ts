import { httpClient } from '../api/httpClient';

export const conductoresApi = {
  obtenerTodos: (params = {}) =>
    httpClient.get('/conductores', { params }),

  obtenerActivos: (params = {}) =>
    httpClient.get('/conductores/activos', { params }),

  obtenerInactivos: (params = {}) =>
    httpClient.get('/conductores/inactivos', { params }),

  buscar: (busqueda: string, params = {}) =>
    httpClient.get('/conductores/buscar', { params: { busqueda, ...params } }),

  obtenerPorId: (idusuario: number) =>
    httpClient.get(`/conductores/${idusuario}`),

  obtenerPorDocumento: (documento: string) =>
    httpClient.get('/conductores/documento', { params: { documento } }),

  crear: (formData: FormData) =>
    httpClient.post('/conductores', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  actualizar: (idusuario: number, formData: FormData) =>
    httpClient.put(`/conductores/${idusuario}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  activar: (idusuario: number) =>
    httpClient.patch(`/conductores/${idusuario}/activar`, {}),

  desactivar: (idusuario: number) =>
    httpClient.patch(`/conductores/${idusuario}/desactivar`, {}),

  eliminar: (idusuario: number) =>
    httpClient.delete(`/conductores/${idusuario}`),
};
