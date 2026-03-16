import type { AseguradoraRepository } from '../../domain/repositories/AseguradoraRepository';
import type { Aseguradora } from '../../domain/entities/Aseguradora';
import { httpClient } from '../api/httpClient';

export class ApiAseguradoraRepository implements AseguradoraRepository {
  async findAll(): Promise<Aseguradora[]> {
    const response = await httpClient.get('/aseguradoras');
    // Normalize: API may return { data: [...] } or { content: [...] } or the array directly
    const raw = response.data;
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.data)) return raw.data;
    if (raw && Array.isArray(raw.content)) return raw.content;
    if (raw && Array.isArray(raw.aseguradoras)) return raw.aseguradoras;
    return [];
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
