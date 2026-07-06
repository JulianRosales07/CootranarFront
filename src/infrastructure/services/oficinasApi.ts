import { httpClient } from '../api/httpClient';

export const oficinasApi = {
  obtenerTodas: (params: Record<string, unknown> = {}) => 
    httpClient.get('/oficinas', { params }),
  
  obtenerActivas: (params: Record<string, unknown> = {}) => 
    httpClient.get('/oficinas/activas', { params }),
  
  obtenerInactivas: (params: Record<string, unknown> = {}) => 
    httpClient.get('/oficinas/inactivas', { params }),
  
  obtenerPorId: (id: number | string) => 
    httpClient.get(`/oficinas/${id}`),
  
  buscar: (busqueda: string, params: Record<string, unknown> = {}) => 
    httpClient.get(`/oficinas/buscar`, { params: { busqueda, ...params } }),
  
  obtenerParaSelect: () => 
    httpClient.get('/oficinas/select'),
  
  obtenerPorAgencia: (idAgencia: number | string) => 
    httpClient.get('/oficinas/agencia', { params: { agencia: idAgencia } }),
  
  crear: (data: Record<string, unknown>) => 
    httpClient.post('/oficinas', data),
  
  actualizar: (id: number | string, data: Record<string, unknown>) => 
    httpClient.put(`/oficinas/${id}`, data),
  
  activar: (id: number | string) => 
    httpClient.patch(`/oficinas/activar/${id}`),
  
  eliminar: (id: number | string) => 
    httpClient.patch(`/oficinas/desactivar/${id}`)
};
