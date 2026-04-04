import { httpClient } from '../api/httpClient';

export const departamentosApi = {
  obtenerTodos: (params = {}) => 
    httpClient.get('/departamentos', { params }),
  
  obtenerActivos: (params = {}) => 
    httpClient.get('/departamentos/activos', { params }),
};
