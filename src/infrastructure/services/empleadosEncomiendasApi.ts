import { httpClient } from '../api/httpClient';

export const empleadosEncomiendasApi = {
  obtenerTodos: (params = {}) => 
    httpClient.get('/empleados-encomiendas', { params }),
  
  obtenerActivos: (params = {}) => 
    httpClient.get('/empleados-encomiendas/activos', { params }),
  
  obtenerInactivos: (params = {}) => 
    httpClient.get('/empleados-encomiendas/inactivos', { params }),
  
  obtenerPorId: (id: string) => 
    httpClient.get(`/empleados-encomiendas/${id}`),
  
  buscar: (busqueda: string, params = {}) => 
    httpClient.get(`/empleados-encomiendas/buscar`, { params: { busqueda, ...params } }),
  
  crear: (data: any) => 
    httpClient.post('/empleados-encomiendas', data),
  
  actualizar: (id: string, data: any) => 
    httpClient.put(`/empleados-encomiendas/${id}`, data),
  
  activar: (id: string) => 
    httpClient.patch(`/empleados-encomiendas/activar/${id}`),
  
  eliminar: (id: string) => 
    httpClient.patch(`/empleados-encomiendas/desactivar/${id}`)
};
