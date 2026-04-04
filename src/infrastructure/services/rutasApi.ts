import { httpClient } from '../api/httpClient';

export const rutasApi = {
  obtenerTodas: (params = {}) => 
    httpClient.get('/rutas', { params }),
  
  obtenerActivas: (params = {}) => 
    httpClient.get('/rutas/activas', { params }),
  
  obtenerInactivas: (params = {}) => 
    httpClient.get('/rutas/inactivas', { params }),
  
  obtenerPorId: (id) => 
    httpClient.get(`/rutas/${id}`),
  
  buscar: (busqueda, params = {}) => 
    httpClient.get(`/rutas/buscar`, { params: { busqueda, ...params } }),
  
  crear: (data) => 
    httpClient.post('/rutas', data),
  
  actualizar: (id, data) => 
    httpClient.put(`/rutas/${id}`, data),
  
  activar: (id) => 
    httpClient.patch(`/rutas/activar/${id}`),
  
  eliminar: (id) => 
    httpClient.patch(`/rutas/desactivar/${id}`)
};
