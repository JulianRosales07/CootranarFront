import type { AgenciaRepository } from '../../domain/repositories/AgenciaRepository';
import type { Agencia } from '../../domain/entities/Agencia';
import { httpClient } from '../api/httpClient';

export class ApiAgenciaRepository implements AgenciaRepository {
  async findAll(): Promise<Agencia[]> {
    const response = await httpClient.get('/agencias');
    return response.data;
  }

  async findById(id: string): Promise<Agencia | null> {
    try {
      const response = await httpClient.get(`/agencias/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async save(data: Omit<Agencia, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agencia> {
    const response = await httpClient.post('/agencias', data);
    return response.data;
  }

  async update(id: string, data: Partial<Agencia>): Promise<Agencia> {
    const response = await httpClient.put(`/agencias/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/agencias/${id}`);
  }
}
