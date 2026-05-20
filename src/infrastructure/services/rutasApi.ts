import { httpClient } from '../api/httpClient';

export const rutasApi = {
  obtenerTodas: (params = {}) => 
    httpClient.get('/rutas', { params }),
  
  obtenerActivas: (params = {}) => 
    httpClient.get('/rutas/activas', { params }),
  
  obtenerInactivas: (params = {}) => 
    httpClient.get('/rutas/inactivas', { params }),
  
  obtenerPorId: (id: string | number) => 
    httpClient.get(`/rutas/${id}`),
  
  buscar: (busqueda: string, params = {}) => 
    httpClient.get(`/rutas/buscar`, { params: { busqueda, ...params } }),
  
  crear: (data: any) => 
    httpClient.post('/rutas', data),
  
  actualizar: (id: string | number, data: any) => 
    httpClient.put(`/rutas/${id}`, data),
  
  activar: (id: string | number) => 
    httpClient.patch(`/rutas/activar/${id}`),

  desactivar: (id: string | number) => 
    httpClient.patch(`/rutas/desactivar/${id}`),

  eliminar: (id: string | number) => 
    httpClient.patch(`/rutas/desactivar/${id}`),

  obtenerPuntos: (idruta: string | number) =>
    httpClient.get(`/rutas/${idruta}/puntos`),

  obtenerCompletitudTarifas: (idruta: string | number) =>
    httpClient.get(`/rutas/${idruta}/tarifas/completitud`),
};
