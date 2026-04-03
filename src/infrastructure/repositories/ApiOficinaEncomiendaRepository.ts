import type { OficinaEncomiendaRepository } from '../../domain/repositories/OficinaEncomiendaRepository';
import type { OficinaEncomienda } from '../../domain/entities/OficinaEncomienda';
import { httpClient } from '../api/httpClient';

function mapFromBackend(raw: any): OficinaEncomienda {
  return {
    id: String(raw.idoficinaencomienda ?? raw.id),
    nombre: raw.nombre ?? '',
    direccion: raw.direccion ?? '',
    telefono: raw.telefono ?? '',
    ciudadId: String(raw.idciudad ?? raw.ciudadId ?? ''),
    ciudadNombre: raw.ciudad_nombre ?? raw.ciudadNombre ?? '',
    activo: raw.activo ?? raw.estado ?? true,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  };
}

function mapToBackend(data: Partial<OficinaEncomienda>) {
  const payload: any = {};
  if (data.nombre !== undefined) payload.nombre = data.nombre;
  if (data.direccion !== undefined) payload.direccion = data.direccion;
  if (data.telefono !== undefined) payload.telefono = data.telefono;
  if (data.ciudadId !== undefined) payload.idciudad = Number(data.ciudadId) || data.ciudadId;
  return payload;
}

export class ApiOficinaEncomiendaRepository implements OficinaEncomiendaRepository {
  async findAll(): Promise<OficinaEncomienda[]> {
    const response = await httpClient.get('/oficinas-encomiendas');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data.map(mapFromBackend) : [];
  }

  async findActivas(): Promise<OficinaEncomienda[]> {
    const response = await httpClient.get('/oficinas-encomiendas/activas');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data.map(mapFromBackend) : [];
  }

  async buscar(busqueda: string): Promise<OficinaEncomienda[]> {
    const response = await httpClient.get(`/oficinas-encomiendas/buscar?busqueda=${encodeURIComponent(busqueda)}`);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data.map(mapFromBackend) : [];
  }

  async findByCiudad(): Promise<OficinaEncomienda[]> {
    const response = await httpClient.get('/oficinas-encomiendas/ciudad');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data.map(mapFromBackend) : [];
  }

  async save(data: Omit<OficinaEncomienda, 'id' | 'createdAt' | 'updatedAt'>): Promise<OficinaEncomienda> {
    const response = await httpClient.post('/oficinas-encomiendas', mapToBackend(data));
    const raw = response.data?.data ?? response.data;
    return mapFromBackend(raw);
  }

  async update(id: string, data: Partial<OficinaEncomienda>): Promise<OficinaEncomienda> {
    const response = await httpClient.put(`/oficinas-encomiendas/${id}`, mapToBackend(data));
    const raw = response.data?.data ?? response.data;
    return mapFromBackend(raw);
  }

  async activar(id: string): Promise<void> {
    await httpClient.patch(`/oficinas-encomiendas/activar/${id}`);
  }

  async desactivar(id: string): Promise<void> {
    await httpClient.patch(`/oficinas-encomiendas/desactivar/${id}`);
  }
}
