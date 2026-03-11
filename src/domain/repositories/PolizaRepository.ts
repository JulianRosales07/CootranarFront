import type { Poliza } from '../entities/Poliza';

export interface PolizaRepository {
  findById(id: string): Promise<Poliza | null>;
  findAll(): Promise<Poliza[]>;
  save(poliza: Omit<Poliza, 'id' | 'createdAt' | 'updatedAt'>): Promise<Poliza>;
  update(id: string, data: Partial<Poliza>): Promise<Poliza>;
  delete(id: string): Promise<void>;
}
