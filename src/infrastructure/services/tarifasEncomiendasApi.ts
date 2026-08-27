import { httpClient } from '../api/httpClient';

export const tarifasEncomiendasApi = {
  listar: (params: Record<string, any> = {}) => 
    httpClient.get('/tarifas-encomiendas', { params }),

  crear: (data: { idOficinaOrigen: number; idOficinaDestino: number; valorBase: number }) => 
    httpClient.post('/tarifas-encomiendas', data),

  actualizar: (id: number | string, data: { valorBase: number; idOficinaOrigen?: number; idOficinaDestino?: number }) => 
    httpClient.put(`/tarifas-encomiendas/${id}`, data),
};

export default tarifasEncomiendasApi;
