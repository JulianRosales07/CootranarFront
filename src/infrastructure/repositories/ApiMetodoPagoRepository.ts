import type { MetodoPagoRepository } from '../../domain/repositories/MetodoPagoRepository';
import { httpClient } from '../api/httpClient';

export class ApiMetodoPagoRepository implements MetodoPagoRepository {
  async obtenerTodos(): Promise<any> {
    return httpClient.get('/metodos-pago');
  }

  async obtenerActivos(): Promise<any> {
    return httpClient.get('/metodos-pago');
  }
}

export const apiMetodoPagoRepository = new ApiMetodoPagoRepository();
