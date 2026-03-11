import type { TipoServicioRepository } from '../../domain/repositories/TipoServicioRepository';
import type { TipoServicio } from '../../domain/entities/TipoServicio';
import { httpClient } from '../api/httpClient';

export class ApiTipoServicioRepository implements TipoServicioRepository {
  async findAll(): Promise<TipoServicio[]> {
    const response = await httpClient.get('/tipos-servicio');
    return response.data;
  }

  async findById(id: string): Promise<TipoServicio | null> {
    try {
      const response = await httpClient.get(`/tipos-servicio/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async save(data: Omit<TipoServicio, 'id' | 'createdAt' | 'updatedAt'>): Promise<TipoServicio> {
    const response = await httpClient.post('/tipos-servicio', data);
    return response.data;
  }

  async update(id: string, data: Partial<TipoServicio>): Promise<TipoServicio> {
    const response = await httpClient.put(`/tipos-servicio/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/tipos-servicio/${id}`);
  }
}
