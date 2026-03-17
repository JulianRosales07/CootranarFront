import type { AseguradoraRepository } from '../../domain/repositories/AseguradoraRepository';
import type { Aseguradora } from '../../domain/entities/Aseguradora';
import { httpClient } from '../api/httpClient';

export class ApiAseguradoraRepository implements AseguradoraRepository {
  async findAll(): Promise<Aseguradora[]> {
    const response = await httpClient.get('/aseguradoras');
    const aseguradoras = Array.isArray(response.data) ? response.data : response.data?.data?.aseguradoras || [];
    return aseguradoras.map((a: any) => ({
      id: String(a.idaseguradora || a.id),
      nombre: a.nombre,
      nit: a.nit,
      activo: a.activo
    }));
  }

  async findById(id: string): Promise<Aseguradora | null> {
    try {
      const response = await httpClient.get(`/aseguradoras/${id}`);
      const a = response.data?.data?.aseguradora || response.data;
      if (!a) return null;
      return {
        id: String(a.idaseguradora || a.id),
        nombre: a.nombre,
        nit: a.nit,
        activo: a.activo
      };
    } catch (error) {
      return null;
    }
  }

  async save(data: Omit<Aseguradora, 'id' | 'activo'>): Promise<Aseguradora> {
    const response = await httpClient.post('/aseguradoras', data);
    const a = response.data?.data?.aseguradora || response.data;
    return {
      id: String(a.idaseguradora || a.id),
      nombre: a.nombre,
      nit: a.nit,
      activo: a.activo
    };
  }

  async update(id: string, data: Partial<Aseguradora>): Promise<Aseguradora> {
    // IMPORTANTE: Tu backend tiene un error tipográfico en actualizarAseguradora:
    // comprueba hasOwnProperty("apellido") para luego usar "datosActualizados.nit".
    // Por ende es necesario mandarle el campo "apellido" ficticio.
    const payload = {
      ...data,
      apellido: data.nit // Hack para el backend!!
    };
    
    const response = await httpClient.put(`/aseguradoras/${id}`, payload);
    const a = response.data?.data?.aseguradora || response.data;
    return {
      id: String(a.idaseguradora || a.id),
      nombre: a.nombre,
      nit: a.nit,
      activo: a.activo
    };
  }

  async delete(id: string): Promise<void> {
    await httpClient.patch(`/aseguradoras/desactivar/${id}`);
  }

  async activate(id: string): Promise<void> {
    await httpClient.patch(`/aseguradoras/activar/${id}`);
  }
}
