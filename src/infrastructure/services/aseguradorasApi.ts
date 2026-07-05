import { httpClient } from '../api/httpClient';

export const aseguradorasApi = {
  obtenerTodas: (params: Record<string, unknown> = {}) => 
    httpClient.get('/aseguradoras', { params }),
  
  obtenerActivas: (params: Record<string, unknown> = {}) => 
    httpClient.get('/aseguradoras/activas', { params }),
  
  obtenerInactivas: (params: Record<string, unknown> = {}) => 
    httpClient.get('/aseguradoras/inactivas', { params }),
  
  obtenerPorId: (id: number | string) => 
    httpClient.get(`/aseguradoras/${id}`),
  
  buscar: (busqueda: string, params: Record<string, unknown> = {}) => 
    httpClient.get(`/aseguradoras/buscar`, { params: { busqueda, ...params } }),
  
  crear: (data: Record<string, unknown>) => 
    httpClient.post('/aseguradoras', data),
  
  actualizar: (id: number | string, data: Record<string, unknown>) => 
    httpClient.put(`/aseguradoras/${id}`, data),
  
  activar: (id: number | string) => 
    httpClient.patch(`/aseguradoras/activar/${id}`),
  
  eliminar: (id: number | string) => 
    httpClient.patch(`/aseguradoras/desactivar/${id}`)
};
