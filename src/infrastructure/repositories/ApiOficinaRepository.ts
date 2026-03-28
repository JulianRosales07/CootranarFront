import type { OficinaRepository } from '../../domain/repositories/OficinaRepository';
import type { Oficina } from '../../domain/entities/Oficina';
import { httpClient } from '../api/httpClient';

// Mapea la respuesta del backend al formato del frontend
function mapFromBackend(raw: any): Oficina {
  return {
    id: String(raw.idoficina ?? raw.id),
    nombre: raw.nombre ?? '',
    codigo: raw.codigo ?? '',
    direccion: raw.direccion ?? '',
    telefono: raw.telefono ?? '',
    email: raw.email ?? raw.correo ?? '',
    agenciaId: String(raw.idagencia ?? raw.agenciaId ?? ''),
    activo: raw.activo ?? raw.estado ?? true,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  };
}

// Mapea del frontend al formato que espera el backend
function mapToBackend(data: Partial<Oficina>) {
  const payload: any = {};
  if (data.agenciaId !== undefined) payload.idagencia = Number(data.agenciaId) || data.agenciaId;
  if (data.codigo !== undefined) payload.codigo = data.codigo;
  return payload;
}

export class ApiOficinaRepository implements OficinaRepository {
  async findAll(): Promise<Oficina[]> {
    const response = await httpClient.get('/oficinas');
    const data = response.data?.data ?? response.data;
    if (Array.isArray(data)) return data.map(mapFromBackend);
    return [];
  }

  async findById(id: string): Promise<Oficina | null> {
    try {
      const response = await httpClient.get(`/oficinas/${id}`);
      const raw = response.data?.data ?? response.data;
      return mapFromBackend(raw);
    } catch {
      return null;
    }
  }

  async save(data: Omit<Oficina, 'id' | 'createdAt' | 'updatedAt'>): Promise<Oficina> {
    const response = await httpClient.post('/oficinas', mapToBackend(data));
    const raw = response.data?.data ?? response.data;
    return mapFromBackend(raw);
  }

  async update(id: string, data: Partial<Oficina>): Promise<Oficina> {
    const response = await httpClient.put(`/oficinas/${id}`, mapToBackend(data));
    const raw = response.data?.data ?? response.data;
    return mapFromBackend(raw);
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/oficinas/${id}`);
  }
}
