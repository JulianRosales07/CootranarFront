import type { OficinaEncomienda } from '../entities/OficinaEncomienda';

export interface OficinaEncomiendaRepository {
  findAll(): Promise<OficinaEncomienda[]>;
  findActivas(): Promise<OficinaEncomienda[]>;
  buscar(busqueda: string): Promise<OficinaEncomienda[]>;
  findByCiudad(): Promise<OficinaEncomienda[]>;
  save(data: Omit<OficinaEncomienda, 'id' | 'createdAt' | 'updatedAt'>): Promise<OficinaEncomienda>;
  update(id: string, data: Partial<OficinaEncomienda>): Promise<OficinaEncomienda>;
  activar(id: string): Promise<void>;
  desactivar(id: string): Promise<void>;
}
