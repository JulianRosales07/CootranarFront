import type { EncomiendaRepository } from '../../domain/repositories/EncomiendaRepository';
import type { Encomienda, EstadoEncomienda } from '../../domain/entities/Encomienda';
import { httpClient } from '../api/httpClient';

export class ApiEncomiendaRepository implements EncomiendaRepository {
  async findAll(): Promise<Encomienda[]> {
    const response = await httpClient.get('/encomiendas');
    return response.data;
  }

  async findById(id: string): Promise<Encomienda | null> {
    try {
      const response = await httpClient.get(`/encomiendas/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async findByEstado(estado: EstadoEncomienda): Promise<Encomienda[]> {
    const response = await httpClient.get(`/encomiendas?estado=${estado}`);
    return response.data;
  }

  async save(data: Omit<Encomienda, 'id' | 'createdAt'>): Promise<Encomienda> {
    const response = await httpClient.post('/encomiendas', data);
    return response.data;
  }

  async update(id: string, data: Partial<Encomienda>): Promise<Encomienda> {
    const response = await httpClient.put(`/encomiendas/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/encomiendas/${id}`);
  }
}
