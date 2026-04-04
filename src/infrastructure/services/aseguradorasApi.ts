import { httpClient } from '../api/httpClient';

export const aseguradorasApi = {
  obtenerTodas: (params = {}) => 
    httpClient.get('/aseguradoras', { params }),
  
  obtenerActivas: (params = {}) => 
    httpClient.get('/aseguradoras/activas', { params }),
  
  obtenerInactivas: (params = {}) => 
    httpClient.get('/aseguradoras/inactivas', { params }),
  
  obtenerPorId: (id) => 
    httpClient.get(`/aseguradoras/${id}`),
  
  buscar: (busqueda, params = {}) => 
    httpClient.get(`/aseguradoras/buscar`, { params: { busqueda, ...params } }),
  
  crear: (data) => 
    httpClient.post('/aseguradoras', data),
  
  actualizar: (id, data) => 
    httpClient.put(`/aseguradoras/${id}`, data),
  
  activar: (id) => 
    httpClient.patch(`/aseguradoras/activar/${id}`),
  
  eliminar: (id) => 
    httpClient.patch(`/aseguradoras/desactivar/${id}`)
};
