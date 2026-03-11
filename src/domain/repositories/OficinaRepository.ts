import type { Oficina } from '../entities/Oficina';

export interface OficinaRepository {
  findById(id: string): Promise<Oficina | null>;
  findAll(): Promise<Oficina[]>;
  save(oficina: Omit<Oficina, 'id' | 'createdAt' | 'updatedAt'>): Promise<Oficina>;
  update(id: string, data: Partial<Oficina>): Promise<Oficina>;
  delete(id: string): Promise<void>;
}
