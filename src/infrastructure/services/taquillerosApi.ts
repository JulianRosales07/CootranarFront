import { httpClient } from '../api/httpClient';

export const taquillerosApi = {
  obtenerTodos: (params = {}) => 
    httpClient.get('/taquilleros', { params }),
  
  obtenerActivos: (params = {}) => 
    httpClient.get('/taquilleros/activos', { params }),
  
  obtenerInactivos: (params = {}) => 
    httpClient.get('/taquilleros/inactivos', { params }),
  
  obtenerPorId: (id) => 
    httpClient.get(`/taquilleros/${id}`),
  
  buscar: (busqueda, params = {}) => 
    httpClient.get(`/taquilleros/buscar`, { params: { busqueda, ...params } }),
  
  crear: (data) => 
    httpClient.post('/taquilleros', data),
  
  actualizar: (id, data) => 
    httpClient.put(`/taquilleros/${id}`, data),
  
  activar: (id) => 
    httpClient.patch(`/taquilleros/activar/${id}`),
  
  eliminar: (id) => 
    httpClient.patch(`/taquilleros/desactivar/${id}`)
};
