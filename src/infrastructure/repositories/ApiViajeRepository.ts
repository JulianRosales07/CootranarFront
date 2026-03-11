import type { ViajeRepository } from '../../domain/repositories/ViajeRepository';
import type { Viaje } from '../../domain/entities/Viaje';
import { httpClient } from '../api/httpClient';

export class ApiViajeRepository implements ViajeRepository {
  async findAll(): Promise<Viaje[]> {
    const response = await httpClient.get('/viajes');
    return response.data;
  }

  async findById(id: string): Promise<Viaje | null> {
    try {
      const response = await httpClient.get(`/viajes/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async save(data: Omit<Viaje, 'id' | 'createdAt' | 'updatedAt'>): Promise<Viaje> {
    const response = await httpClient.post('/viajes', data);
    return response.data;
  }

  async update(id: string, data: Partial<Viaje>): Promise<Viaje> {
    const response = await httpClient.put(`/viajes/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/viajes/${id}`);
  }
}
