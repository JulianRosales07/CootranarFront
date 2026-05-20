import { httpClient } from '../api/httpClient';

export const tarifasRutaApi = {
  obtenerTodas: (params = {}) => 
    httpClient.get('/tarifas-tramo', { params }),
  
  obtenerPorRuta: (idRuta: string, params = {}) => 
    httpClient.get(`/tarifas-tramo/ruta/${idRuta}`, { params }),
  
  obtenerPorId: (id: string) => 
    httpClient.get(`/tarifas-tramo/${id}`),
  
  crear: (data: any) => 
    httpClient.post('/tarifas-tramo', data),
  
  actualizar: (id: string, data: any) => 
    httpClient.put(`/tarifas-tramo/${id}`, data),
  
  eliminar: (id: string) => 
    httpClient.delete(`/tarifas-tramo/${id}`),

  obtenerCompletitud: (idRuta: string) =>
    httpClient.get(`/rutas/${idRuta}/tarifas/completitud`),

  configurarMasivo: (idRuta: string, data: any) =>
    httpClient.post(`/tarifas-tramo/ruta/${idRuta}/masivo`, data),
};
