import type { EmpleadoEncomiendaRepository } from '../../domain/repositories/EmpleadoEncomiendaRepository';
import type { EmpleadoEncomienda } from '../../domain/entities/EmpleadoEncomienda';
import { httpClient } from '../api/httpClient';

function mapFromBackend(raw: any): EmpleadoEncomienda {
  return {
    id: String(raw.idempleadoencomienda ?? raw.id),
    nombre: raw.nombre ?? '',
    documento: raw.documento ?? '',
    telefono: raw.telefono ?? '',
    email: raw.email ?? raw.correo ?? '',
    agencia: raw.agencia ?? raw.agencia_nombre ?? '',
    activo: raw.activo ?? raw.estado ?? true,
  };
}

function mapToBackend(data: Partial<EmpleadoEncomienda>) {
  const payload: any = {};
  if (data.nombre !== undefined) payload.nombre = data.nombre;
  if (data.documento !== undefined) payload.documento = data.documento;
  if (data.telefono !== undefined) payload.telefono = data.telefono;
  if (data.email !== undefined) payload.correo = data.email;
  if (data.agencia !== undefined) payload.agencia = data.agencia;
  return payload;
}

export class ApiEmpleadoEncomiendaRepository implements EmpleadoEncomiendaRepository {
  async findActivos(): Promise<EmpleadoEncomienda[]> {
    const response = await httpClient.get('/empleados-encomiendas/activos');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data.map(mapFromBackend) : [];
  }

  async buscar(busqueda: string): Promise<EmpleadoEncomienda[]> {
    const response = await httpClient.get(`/empleados-encomiendas/buscar?busqueda=${encodeURIComponent(busqueda)}`);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data.map(mapFromBackend) : [];
  }

  async buscarPorDocumento(documento: string): Promise<EmpleadoEncomienda | null> {
    try {
      const response = await httpClient.get(`/empleados-encomiendas/documento?documento=${encodeURIComponent(documento)}`);
      const raw = response.data?.data ?? response.data;
      return mapFromBackend(raw);
    } catch {
      return null;
    }
  }

  async save(data: Omit<EmpleadoEncomienda, 'id'>): Promise<EmpleadoEncomienda> {
    const response = await httpClient.post('/empleados-encomiendas', mapToBackend(data));
    const raw = response.data?.data ?? response.data;
    return mapFromBackend(raw);
  }

  async update(id: string, data: Partial<EmpleadoEncomienda>): Promise<EmpleadoEncomienda> {
    const response = await httpClient.put(`/empleados-encomiendas/${id}`, mapToBackend(data));
    const raw = response.data?.data ?? response.data;
    return mapFromBackend(raw);
  }
}
