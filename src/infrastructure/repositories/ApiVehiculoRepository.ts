import type { VehiculoRepository } from '../../domain/repositories/VehiculoRepository';
import type { Vehiculo } from '../../domain/entities/Vehiculo';
import { httpClient } from '../api/httpClient';

export class ApiVehiculoRepository implements VehiculoRepository {
  async findAll(): Promise<Vehiculo[]> {
    const response = await httpClient.get('/vehiculos');
    return response.data;
  }

  async findById(id: string): Promise<Vehiculo | null> {
    try {
      const response = await httpClient.get(`/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async save(data: Omit<Vehiculo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehiculo> {
    const response = await httpClient.post('/vehiculos', data);
    return response.data;
  }

  async update(id: string, data: Partial<Vehiculo>): Promise<Vehiculo> {
    const response = await httpClient.put(`/vehiculos/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/vehiculos/${id}`);
  }
}
