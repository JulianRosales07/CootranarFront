import { httpClient } from '../api/httpClient';

export const tarifasRutaApi = {
  obtenerTodas: (params = {}) => 
    httpClient.get('/tarifas-ruta', { params }),
  
  obtenerPorRuta: (idruta) => 
    httpClient.get(`/tarifas-ruta/ruta/${idruta}`),
  
  obtenerPorRutaYTipoBus: (idruta, idtipobus) => 
    httpClient.get(`/tarifas-ruta/ruta/${idruta}/tipobus/${idtipobus}`),
  
  obtenerPorId: (id) => 
    httpClient.get(`/tarifas-ruta/${id}`),
  
  crear: (data) => 
    httpClient.post('/tarifas-ruta', data),
  
  actualizar: (id, data) => 
    httpClient.put(`/tarifas-ruta/${id}`, data),
  
  eliminar: (id) => 
    httpClient.delete(`/tarifas-ruta/${id}`)
};
