import { httpClient } from '../api/httpClient';

export const configuracionSistemaApi = {
  obtenerEstadoPrecioGlobal: () => 
    httpClient.get('/configuracion-sistema/estado-precio-global'),
  
  cambiarEstadoPrecioGlobal: (estado: string) => 
    httpClient.patch('/configuracion-sistema/estado-precio-global', { estado })
};
