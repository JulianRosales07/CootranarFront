import type { RutaRepository } from '../../domain/repositories/RutaRepository';
import type { Ruta } from '../../domain/entities/Ruta';
import { httpClient } from '../api/httpClient';

export class ApiRutaRepository implements RutaRepository {
  async findAll(): Promise<Ruta[]> {
    const response = await httpClient.get('/rutas');
    return response.data;
  }

  async findById(id: string): Promise<Ruta | null> {
    try {
      const response = await httpClient.get(`/rutas/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async findActivas(): Promise<Ruta[]> {
    const response = await httpClient.get('/rutas?activa=true');
    return response.data;
  }

  async save(data: Omit<Ruta, 'id'>): Promise<Ruta> {
    const response = await httpClient.post('/rutas', data);
    return response.data;
  }

  async update(id: string, data: Partial<Ruta>): Promise<Ruta> {
    const response = await httpClient.put(`/rutas/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/rutas/${id}`);
  }
}
