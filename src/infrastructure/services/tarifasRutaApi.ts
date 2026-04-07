import { httpClient } from '../api/httpClient';

export const tarifasRutaApi = {
  obtenerTodas: (params = {}) => 
    httpClient.get('/tarifas-ruta', { params }),
  
  obtenerPorRuta: (idRuta: string, params = {}) => 
    httpClient.get(`/tarifas-ruta/ruta/${idRuta}`, { params }),
  
  obtenerPorId: (id: string) => 
    httpClient.get(`/tarifas-ruta/${id}`),
  
  crear: (data: any) => 
    httpClient.post('/tarifas-ruta', data),
  
  actualizar: (id: string, data: any) => 
    httpClient.put(`/tarifas-ruta/${id}`, data),
  
  eliminar: (id: string) => 
    httpClient.delete(`/tarifas-ruta/${id}`)
};
