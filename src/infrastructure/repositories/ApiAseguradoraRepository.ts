import type { AseguradoraRepository } from '../../domain/repositories/AseguradoraRepository';
import type { Aseguradora } from '../../domain/entities/Aseguradora';
import { httpClient } from '../api/httpClient';

export class ApiAseguradoraRepository implements AseguradoraRepository {
  async findAll(): Promise<Aseguradora[]> {
    const response = await httpClient.get('/aseguradoras');
    return response.data;
  }

  async findById(id: string): Promise<Aseguradora | null> {
    try {
      const response = await httpClient.get(`/aseguradoras/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async save(data: Omit<Aseguradora, 'id' | 'createdAt' | 'updatedAt'>): Promise<Aseguradora> {
    const response = await httpClient.post('/aseguradoras', data);
    return response.data;
  }

  async update(id: string, data: Partial<Aseguradora>): Promise<Aseguradora> {
    const response = await httpClient.put(`/aseguradoras/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/aseguradoras/${id}`);
  }
}
