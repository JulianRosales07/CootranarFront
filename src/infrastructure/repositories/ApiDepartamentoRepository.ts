import type { DepartamentoRepository } from '../../domain/repositories/DepartamentoRepository';
import type { Departamento } from '../../domain/entities/Departamento';
import { httpClient } from '../api/httpClient';

function mapFromBackend(raw: any): Departamento {
  return {
    id: String(raw.iddepartamento ?? raw.id),
    nombre: raw.nombre ?? '',
    activo: raw.activo ?? raw.estado ?? true,
  };
}

export class ApiDepartamentoRepository implements DepartamentoRepository {
  async findAll(): Promise<Departamento[]> {
    const response = await httpClient.get('/departamentos');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data.map(mapFromBackend) : [];
  }

  async findActivos(): Promise<Departamento[]> {
    const response = await httpClient.get('/departamentos/activos');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data.map(mapFromBackend) : [];
  }
}
