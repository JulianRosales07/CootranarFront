import type { TipoBusRepository } from '../../domain/repositories/TipoBusRepository';
import type { TipoBus } from '../../domain/entities/TipoBus';
import { httpClient } from '../api/httpClient';

export class ApiTipoBusRepository implements TipoBusRepository {
  async findAll(): Promise<TipoBus[]> {
    const response = await httpClient.get('/tipobus');
    const tipos = Array.isArray(response.data) ? response.data : response.data?.data?.tiposbus || [];
    return tipos.map((t: any) => ({
      id: String(t.idtipobus || t.id),
      nombre: t.nombre,
      descripcion: t.descripcion,
      activo: t.activo
    }));
  }

  async findById(id: string): Promise<TipoBus | null> {
    try {
      const response = await httpClient.get(`/tipobus/${id}`);
      const t = response.data?.data?.tipobus || response.data;
      if (!t) return null;
      return {
        id: String(t.idtipobus || t.id),
        nombre: t.nombre,
        descripcion: t.descripcion,
        activo: t.activo
      };
    } catch (error) {
      return null;
    }
  }

  async save(data: Omit<TipoBus, 'id' | 'activo'>): Promise<TipoBus> {
    const response = await httpClient.post('/tipobus', data);
    const t = response.data?.data?.tipobus || response.data;
    return {
      id: String(t.idtipobus || t.id),
      nombre: t.nombre,
      descripcion: t.descripcion,
      activo: t.activo
    };
  }

  async update(id: string, data: Partial<TipoBus>): Promise<TipoBus> {
    const response = await httpClient.put(`/tipobus/${id}`, data);
    const t = response.data?.data?.tipobus || response.data;
    return {
      id: String(t.idtipobus || t.id),
      nombre: t.nombre,
      descripcion: t.descripcion,
      activo: t.activo
    };
  }

  async delete(id: string): Promise<void> {
    await httpClient.patch(`/tipobus/desactivar/${id}`);
  }

  async activate(id: string): Promise<void> {
    await httpClient.patch(`/tipobus/activar/${id}`);
  }
}
