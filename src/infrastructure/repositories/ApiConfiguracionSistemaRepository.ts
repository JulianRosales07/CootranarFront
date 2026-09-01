import type { ConfiguracionSistemaRepository } from '../../domain/repositories/ConfiguracionSistemaRepository';
import { httpClient } from '../api/httpClient';

export class ApiConfiguracionSistemaRepository implements ConfiguracionSistemaRepository {
  async obtenerEstadoPrecioGlobal(): Promise<any> {
    return httpClient.get('/configuracion-sistema/estado-precio-global');
  }

  async cambiarEstadoPrecioGlobal(estado: string): Promise<any> {
    return httpClient.patch('/configuracion-sistema/estado-precio-global', { estado });
  }
}

export const apiConfiguracionSistemaRepository = new ApiConfiguracionSistemaRepository();
