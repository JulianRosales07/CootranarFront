import { httpClient } from '../api/httpClient';

export const oficinasEncomiendasApi = {
  obtenerTodas: (params = {}) => 
    httpClient.get('/oficinas-encomiendas', { params }),
  
  obtenerActivas: (params = {}) => 
    httpClient.get('/oficinas-encomiendas/activas', { params }),
  
  obtenerInactivas: (params = {}) => 
    httpClient.get('/oficinas-encomiendas/inactivas', { params }),
  
  obtenerPorId: (id: string) => 
    httpClient.get(`/oficinas-encomiendas/${id}`),
  
  buscar: (busqueda: string, params = {}) => 
    httpClient.get(`/oficinas-encomiendas/buscar`, { params: { busqueda, ...params } }),
  
  crear: (data: any) => 
    httpClient.post('/oficinas-encomiendas', data),
  
  actualizar: (id: string, data: any) => 
    httpClient.put(`/oficinas-encomiendas/${id}`, data),
  
  activar: (id: string) => 
    httpClient.patch(`/oficinas-encomiendas/activar/${id}`),
  
  eliminar: (id: string) => 
    httpClient.patch(`/oficinas-encomiendas/desactivar/${id}`)
};
