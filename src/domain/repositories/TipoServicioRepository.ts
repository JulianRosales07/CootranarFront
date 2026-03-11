import type { TipoServicio } from '../entities/TipoServicio';

export interface TipoServicioRepository {
  findById(id: string): Promise<TipoServicio | null>;
  findAll(): Promise<TipoServicio[]>;
  save(tipoServicio: Omit<TipoServicio, 'id' | 'createdAt' | 'updatedAt'>): Promise<TipoServicio>;
  update(id: string, data: Partial<TipoServicio>): Promise<TipoServicio>;
  delete(id: string): Promise<void>;
}
