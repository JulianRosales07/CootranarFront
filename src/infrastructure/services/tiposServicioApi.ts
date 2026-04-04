import { httpClient } from '../api/httpClient';

export const tiposServicioApi = {
  obtenerTodos: (params = {}) => 
    httpClient.get('/tipoServicio', { params }),
  
  obtenerActivos: (params = {}) => 
    httpClient.get('/tipoServicio/activos', { params }),
  
  obtenerInactivos: (params = {}) => 
    httpClient.get('/tipoServicio/inactivos', { params }),
  
  obtenerPorId: (id: string) => 
    httpClient.get(`/tipoServicio/${id}`),
  
  buscar: (busqueda: string, params = {}) => 
    httpClient.get(`/tipoServicio/buscar`, { params: { busqueda, ...params } }),
  
  crear: (data: any) => 
    httpClient.post('/tipoServicio', data),
  
  actualizar: (id: string, data: any) => 
    httpClient.put(`/tipoServicio/${id}`, data),
  
  activar: (id: string) => 
    httpClient.patch(`/tipoServicio/activar/${id}`),
  
  eliminar: (id: string) => 
    httpClient.patch(`/tipoServicio/desactivar/${id}`)
};
