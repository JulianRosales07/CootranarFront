import type { TaquilleroRepository, CreateTaquilleroData, UpdateTaquilleroData } from '../../domain/repositories/TaquilleroRepository';
import type { Taquillero } from '../../domain/entities/Taquillero';
import { httpClient } from '../api/httpClient';

export class ApiTaquilleroRepository implements TaquilleroRepository {
  async findAll(): Promise<Taquillero[]> {
    const response = await httpClient.get('/taquilleros');
    // El backend puede devolver { success, data } o directamente un array
    return response.data?.data ?? response.data;
  }

  async findActivos(): Promise<Taquillero[]> {
    const response = await httpClient.get('/taquilleros/activos');
    return response.data?.data ?? response.data;
  }

  async create(data: CreateTaquilleroData): Promise<Taquillero> {
    const response = await httpClient.post('/taquilleros', data);
    return response.data?.data ?? response.data;
  }

  async update(idusuario: number, data: UpdateTaquilleroData): Promise<Taquillero> {
    const response = await httpClient.put(`/taquilleros/${idusuario}`, data);
    return response.data?.data ?? response.data;
  }

  async activar(idusuario: number): Promise<void> {
    await httpClient.patch(`/taquilleros/activar/${idusuario}`);
  }
}
