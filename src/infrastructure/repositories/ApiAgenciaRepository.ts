import type { AgenciaRepository } from '../../domain/repositories/AgenciaRepository';
import type { Agencia } from '../../domain/entities/Agencia';
import { httpClient } from '../api/httpClient';

// Mapea la respuesta del backend al formato del frontend
function mapFromBackend(raw: any): Agencia {
  return {
    id: String(raw.idagencia ?? raw.id),
    nombre: raw.nombre ?? '',
    codigo: raw.codigo ?? '',
    direccion: raw.direccion ?? '',
    telefono: raw.telefono ?? '',
    ciudadId: String(raw.idciudad ?? raw.ciudadId ?? ''),
    activo: raw.activo ?? raw.estado ?? true,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  };
}

// Mapea del frontend al formato que espera el backend
function mapToBackend(data: Partial<Agencia>) {
  const payload: any = {};
  if (data.nombre !== undefined) payload.nombre = data.nombre;
  if (data.ciudadId !== undefined) payload.idciudad = Number(data.ciudadId) || data.ciudadId;
  if (data.direccion !== undefined) payload.direccion = data.direccion;
  if (data.telefono !== undefined) payload.telefono = data.telefono;
  return payload;
}

export class ApiAgenciaRepository implements AgenciaRepository {
  async findAll(): Promise<Agencia[]> {
    const response = await httpClient.get('/agencias');
    const data = response.data?.data ?? response.data;
    if (Array.isArray(data)) return data.map(mapFromBackend);
    return [];
  }

  async findById(id: string): Promise<Agencia | null> {
    try {
      const response = await httpClient.get(`/agencias/${id}`);
      const raw = response.data?.data ?? response.data;
      return mapFromBackend(raw);
    } catch {
      return null;
    }
  }

  async save(data: Omit<Agencia, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agencia> {
    const response = await httpClient.post('/agencias', mapToBackend(data));
    const raw = response.data?.data ?? response.data;
    return mapFromBackend(raw);
  }

  async update(id: string, data: Partial<Agencia>): Promise<Agencia> {
    const response = await httpClient.put(`/agencias/${id}`, mapToBackend(data));
    const raw = response.data?.data ?? response.data;
    return mapFromBackend(raw);
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/agencias/${id}`);
  }
}
