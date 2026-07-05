import { httpClient } from '../api/httpClient';

export const ciudadesApi = {
  obtenerTodas: (params: Record<string, unknown> = {}) => 
    httpClient.get('/ciudades', { params }),
  
  obtenerActivas: (params: Record<string, unknown> = {}) => 
    httpClient.get('/ciudades/activas', { params }),
  
  obtenerInactivas: (params: Record<string, unknown> = {}) => 
    httpClient.get('/ciudades/inactivas', { params }),
  
  obtenerPorId: (id: number | string) => 
    httpClient.get(`/ciudades/${id}`),
  
  buscar: (busqueda: string, params: Record<string, unknown> = {}) => 
    httpClient.get(`/ciudades/buscar`, { params: { busqueda, ...params } }),
  
  crear: (data: Record<string, unknown>) => 
    httpClient.post('/ciudades', data),
  
  actualizar: (id: number | string, data: Record<string, unknown>) => 
    httpClient.put(`/ciudades/${id}`, data),
  
  activar: (id: number | string) => 
    httpClient.patch(`/ciudades/activar/${id}`),
  
  desactivar: (id: number | string) => 
    httpClient.patch(`/ciudades/desactivar/${id}`),

  subirImagen: (id: string, archivo: File) => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return httpClient.patch(`/ciudades/${id}/imagen`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
