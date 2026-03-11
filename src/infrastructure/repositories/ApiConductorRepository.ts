import type { ConductorRepository } from '../../domain/repositories/ConductorRepository';
import type { Conductor } from '../../domain/entities/Conductor';
import { httpClient } from '../api/httpClient';

export class ApiConductorRepository implements ConductorRepository {
  async findAll(): Promise<Conductor[]> {
    const response = await httpClient.get('/conductores');
    return response.data;
  }

  async findById(id: string): Promise<Conductor | null> {
    try {
      const response = await httpClient.get(`/conductores/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async save(data: Omit<Conductor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conductor> {
    const response = await httpClient.post('/conductores', data);
    return response.data;
  }

  async update(id: string, data: Partial<Conductor>): Promise<Conductor> {
    const response = await httpClient.put(`/conductores/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/conductores/${id}`);
  }
}
