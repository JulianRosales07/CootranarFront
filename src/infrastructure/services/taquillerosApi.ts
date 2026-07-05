import { httpClient } from '../api/httpClient';

export const taquillerosApi = {
  obtenerTodos: (params: Record<string, unknown> = {}) => 
    httpClient.get('/taquilleros', { params }),
  
  obtenerActivos: (params: Record<string, unknown> = {}) => 
    httpClient.get('/taquilleros/activos', { params }),
  
  obtenerInactivos: (params: Record<string, unknown> = {}) => 
    httpClient.get('/taquilleros/inactivos', { params }),
  
  obtenerPorId: (id: number | string) => 
    httpClient.get(`/taquilleros/${id}`),
  
  buscar: (busqueda: string, params: Record<string, unknown> = {}) => 
    httpClient.get(`/taquilleros/buscar`, { params: { busqueda, ...params } }),
  
  crear: (data: Record<string, unknown>) => 
    httpClient.post('/taquilleros', data),
  
  actualizar: (id: number | string, data: Record<string, unknown>) => 
    httpClient.put(`/taquilleros/${id}`, data),
  
  activar: (id: number | string) => 
    httpClient.patch(`/taquilleros/activar/${id}`),
  
  eliminar: (id: number | string) => 
    httpClient.patch(`/taquilleros/desactivar/${id}`)
};
