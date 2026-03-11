import type { TiqueteRepository } from '../../domain/repositories/TiqueteRepository';
import type { Tiquete, EstadoTiquete } from '../../domain/entities/Tiquete';
import { httpClient } from '../api/httpClient';

export class ApiTiqueteRepository implements TiqueteRepository {
  async findAll(): Promise<Tiquete[]> {
    const response = await httpClient.get('/tiquetes');
    return response.data;
  }

  async findById(id: string): Promise<Tiquete | null> {
    try {
      const response = await httpClient.get(`/tiquetes/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async findByEstado(estado: EstadoTiquete): Promise<Tiquete[]> {
    const response = await httpClient.get(`/tiquetes?estado=${estado}`);
    return response.data;
  }

  async save(data: Omit<Tiquete, 'id' | 'createdAt'>): Promise<Tiquete> {
    const response = await httpClient.post('/tiquetes', data);
    return response.data;
  }

  async update(id: string, data: Partial<Tiquete>): Promise<Tiquete> {
    const response = await httpClient.put(`/tiquetes/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/tiquetes/${id}`);
  }
}
