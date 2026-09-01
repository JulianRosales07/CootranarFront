import type { ViajeRepository } from '../../domain/repositories/ViajeRepository';
import type { Viaje } from '../../domain/entities/Viaje';
import { httpClient } from '../api/httpClient';

export class ApiViajeRepository implements ViajeRepository {
  // --- Generic CRUD (existing) ---

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

  // --- Domain-specific methods (Sprint 4) ---

  async obtenerTodos(params: any = {}): Promise<any> {
    return httpClient.get('/viajes', { params });
  }

  async obtenerActivos(params: any = {}): Promise<any> {
    return httpClient.get('/viajes/activos', { params });
  }

  async obtenerInactivos(params: any = {}): Promise<any> {
    return httpClient.get('/viajes/inactivos', { params });
  }

  async buscar(busqueda: string, params: any = {}): Promise<any> {
    return httpClient.get('/viajes/buscar', { params: { busqueda, ...params } });
  }

  async obtenerPorId(idviaje: string | number): Promise<any> {
    return httpClient.get(`/viajes/${idviaje}`);
  }

  async obtenerDatosVehiculo(numeromovil: string | number): Promise<any> {
    return httpClient.get(`/viajes/vehiculo/${numeromovil}`);
  }

  async crear(data: any): Promise<any> {
    return httpClient.post('/viajes', data);
  }

  async actualizar(idviaje: string | number, data: any): Promise<any> {
    return httpClient.put(`/viajes/${idviaje}`, data);
  }

  async activar(idviaje: string | number): Promise<any> {
    return httpClient.patch(`/viajes/activar/${idviaje}`, {});
  }

  async desactivar(idviaje: string | number): Promise<any> {
    return httpClient.patch(`/viajes/desactivar/${idviaje}`, {});
  }
}

export const apiViajeRepository = new ApiViajeRepository();
