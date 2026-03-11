import type { OficinaRepository } from '../../domain/repositories/OficinaRepository';
import type { Oficina } from '../../domain/entities/Oficina';
import { httpClient } from '../api/httpClient';

export class ApiOficinaRepository implements OficinaRepository {
  async findAll(): Promise<Oficina[]> {
    const response = await httpClient.get('/oficinas');
    return response.data;
  }

  async findById(id: string): Promise<Oficina | null> {
    try {
      const response = await httpClient.get(`/oficinas/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async save(data: Omit<Oficina, 'id' | 'createdAt' | 'updatedAt'>): Promise<Oficina> {
    const response = await httpClient.post('/oficinas', data);
    return response.data;
  }

  async update(id: string, data: Partial<Oficina>): Promise<Oficina> {
    const response = await httpClient.put(`/oficinas/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/oficinas/${id}`);
  }
}
