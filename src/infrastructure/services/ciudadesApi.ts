import { httpClient } from '../api/httpClient';

export const ciudadesApi = {
  obtenerTodas: (params = {}) => 
    httpClient.get('/ciudades', { params }),
  
  obtenerActivas: (params = {}) => 
    httpClient.get('/ciudades/activas', { params }),
  
  obtenerInactivas: (params = {}) => 
    httpClient.get('/ciudades/inactivas', { params }),
  
  obtenerPorId: (id) => 
    httpClient.get(`/ciudades/${id}`),
  
  buscar: (busqueda, params = {}) => 
    httpClient.get(`/ciudades/buscar`, { params: { busqueda, ...params } }),
  
  crear: (data) => 
    httpClient.post('/ciudades', data),
  
  actualizar: (id, data) => 
    httpClient.put(`/ciudades/${id}`, data),
  
  activar: (id) => 
    httpClient.patch(`/ciudades/activar/${id}`),
  
  desactivar: (id) => 
    httpClient.patch(`/ciudades/desactivar/${id}`),

  subirImagen: (id: string, archivo: File) => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return httpClient.patch(`/ciudades/${id}/imagen`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
