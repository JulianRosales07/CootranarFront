import { httpClient } from '../api/httpClient';

export const agenciasApi = {
  obtenerTodas: (params = {}) => 
    httpClient.get('/agencias', { params }),
  
  obtenerActivas: (params = {}) => 
    httpClient.get('/agencias/activas', { params }),
  
  obtenerInactivas: (params = {}) => 
    httpClient.get('/agencias/inactivas', { params }),
  
  obtenerPorId: (id) => 
    httpClient.get(`/agencias/${id}`),
  
  buscar: (busqueda, params = {}) => 
    httpClient.get(`/agencias/buscar`, { params: { busqueda, ...params } }),
  
  obtenerParaSelect: () => 
    httpClient.get('/agencias/select'),
  
  crear: (data) => 
    httpClient.post('/agencias', data),
  
  actualizar: (id, data) => 
    httpClient.put(`/agencias/${id}`, data),
  
  activar: (id) => 
    httpClient.patch(`/agencias/activar/${id}`),
  
  eliminar: (id) => 
    httpClient.patch(`/agencias/desactivar/${id}`)
};
