import { httpClient } from '../api/httpClient';

export const agenciasApi = {
  obtenerTodas: (params: Record<string, unknown> = {}) => 
    httpClient.get('/agencias', { params }),
  
  obtenerActivas: (params: Record<string, unknown> = {}) => 
    httpClient.get('/agencias/activas', { params }),
  
  obtenerInactivas: (params: Record<string, unknown> = {}) => 
    httpClient.get('/agencias/inactivas', { params }),
  
  obtenerPorId: (id: number | string) => 
    httpClient.get(`/agencias/${id}`),
  
  buscar: (busqueda: string, params: Record<string, unknown> = {}) => 
    httpClient.get(`/agencias/buscar`, { params: { busqueda, ...params } }),
  
  obtenerParaSelect: () => 
    httpClient.get('/agencias/select'),
  
  crear: (data: Record<string, unknown>) => 
    httpClient.post('/agencias', data),
  
  actualizar: (id: number | string, data: Record<string, unknown>) => 
    httpClient.put(`/agencias/${id}`, data),
  
  activar: (id: number | string) => 
    httpClient.patch(`/agencias/activar/${id}`),
  
  eliminar: (id: number | string) => 
    httpClient.patch(`/agencias/desactivar/${id}`)
};
