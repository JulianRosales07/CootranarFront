import type { PolizaRepository } from '../../domain/repositories/PolizaRepository';
import type { Poliza } from '../../domain/entities/Poliza';
import { httpClient } from '../api/httpClient';

export class ApiPolizaRepository implements PolizaRepository {
  async findAll(): Promise<Poliza[]> {
    const response = await httpClient.get('/polizas');
    return response.data;
  }

  async findById(id: string): Promise<Poliza | null> {
    try {
      const response = await httpClient.get(`/polizas/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async save(data: Omit<Poliza, 'id' | 'createdAt' | 'updatedAt'>): Promise<Poliza> {
    const response = await httpClient.post('/polizas', data);
    return response.data;
  }

  async update(id: string, data: Partial<Poliza>): Promise<Poliza> {
    const response = await httpClient.put(`/polizas/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/polizas/${id}`);
  }
}
