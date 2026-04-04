import { httpClient } from '../api/httpClient';

export const oficinasApi = {
  obtenerTodas: (params = {}) => 
    httpClient.get('/oficinas', { params }),
  
  obtenerActivas: (params = {}) => 
    httpClient.get('/oficinas/activas', { params }),
  
  obtenerInactivas: (params = {}) => 
    httpClient.get('/oficinas/inactivas', { params }),
  
  obtenerPorId: (id) => 
    httpClient.get(`/oficinas/${id}`),
  
  buscar: (busqueda, params = {}) => 
    httpClient.get(`/oficinas/buscar`, { params: { busqueda, ...params } }),
  
  obtenerParaSelect: () => 
    httpClient.get('/oficinas/select'),
  
  obtenerPorAgencia: (idAgencia) => 
    httpClient.get('/oficinas/agencia', { params: { agencia: idAgencia } }),
  
  crear: (data) => 
    httpClient.post('/oficinas', data),
  
  actualizar: (id, data) => 
    httpClient.put(`/oficinas/${id}`, data),
  
  activar: (id) => 
    httpClient.patch(`/oficinas/activar/${id}`),
  
  eliminar: (id) => 
    httpClient.patch(`/oficinas/desactivar/${id}`)
};
