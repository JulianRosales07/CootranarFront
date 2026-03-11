import type { Encomienda, EstadoEncomienda } from '../entities/Encomienda';

export interface EncomiendaRepository {
  findById(id: string): Promise<Encomienda | null>;
  findAll(): Promise<Encomienda[]>;
  findByEstado(estado: EstadoEncomienda): Promise<Encomienda[]>;
  save(encomienda: Omit<Encomienda, 'id' | 'createdAt'>): Promise<Encomienda>;
  update(id: string, data: Partial<Encomienda>): Promise<Encomienda>;
  delete(id: string): Promise<void>;
}
