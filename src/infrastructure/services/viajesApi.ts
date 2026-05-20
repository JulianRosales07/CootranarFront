import { httpClient } from '../api/httpClient';

export const viajesApi = {
  obtenerTodos: (params = {}) => 
    httpClient.get('/viajes', { params }),
  
  obtenerActivos: (params = {}) => 
    httpClient.get('/viajes/activos', { params }),
  
  obtenerInactivos: (params = {}) => 
    httpClient.get('/viajes/inactivos', { params }),
  
  buscar: (busqueda: string, params = {}) => 
    httpClient.get('/viajes/buscar', { params: { busqueda, ...params } }),
  
  obtenerPorId: (idviaje: string | number) => 
    httpClient.get(`/viajes/${idviaje}`),
  
  obtenerDatosVehiculo: (numeromovil: string | number) => 
    httpClient.get(`/viajes/vehiculo/${numeromovil}`),
  
  crear: (data: any) => 
    httpClient.post('/viajes', data),
  
  actualizar: (idviaje: string | number, data: any) => 
    httpClient.put(`/viajes/${idviaje}`, data),
  
  activar: (idviaje: string | number) => 
    httpClient.patch(`/viajes/activar/${idviaje}`, {}),
  
  desactivar: (idviaje: string | number) => 
    httpClient.patch(`/viajes/desactivar/${idviaje}`, {}),
};
