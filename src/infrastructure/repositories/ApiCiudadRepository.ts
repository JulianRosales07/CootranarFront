import type { CiudadRepository } from '../../domain/repositories/CiudadRepository';
import type { Ciudad } from '../../domain/entities/Ciudad';
import { httpClient } from '../api/httpClient';

export class ApiCiudadRepository implements CiudadRepository {
  async findAll(): Promise<Ciudad[]> {
    const response = await httpClient.get('/ciudades');
    return response.data;
  }

  async findById(id: string): Promise<Ciudad | null> {
    try {
      const response = await httpClient.get(`/ciudades/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async save(data: Omit<Ciudad, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ciudad> {
    const response = await httpClient.post('/ciudades', data);
    return response.data;
  }

  async update(id: string, data: Partial<Ciudad>): Promise<Ciudad> {
    const response = await httpClient.put(`/ciudades/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/ciudades/${id}`);
  }
}
