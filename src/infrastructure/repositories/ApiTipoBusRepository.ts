import type { TipoBusRepository } from '../../domain/repositories/TipoBusRepository';
import type { TipoBus } from '../../domain/entities/TipoBus';
import { httpClient } from '../api/httpClient';

export class ApiTipoBusRepository implements TipoBusRepository {
  async findAll(): Promise<TipoBus[]> {
    const response = await httpClient.get('/tipos-bus');
    const raw = response.data;
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.data)) return raw.data;
    if (raw && Array.isArray(raw.content)) return raw.content;
    if (raw && Array.isArray(raw.tiposBus)) return raw.tiposBus;
    return [];
  }

  async findById(id: string): Promise<TipoBus | null> {
    try {
      const response = await httpClient.get(`/tipos-bus/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async save(data: Omit<TipoBus, 'id' | 'createdAt' | 'updatedAt'>): Promise<TipoBus> {
    const response = await httpClient.post('/tipos-bus', data);
    return response.data;
  }

  async update(id: string, data: Partial<TipoBus>): Promise<TipoBus> {
    const response = await httpClient.put(`/tipos-bus/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/tipos-bus/${id}`);
  }
}
