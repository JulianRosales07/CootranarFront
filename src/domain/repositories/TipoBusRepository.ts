import type { TipoBus } from '../entities/TipoBus';

export interface TipoBusRepository {
  findById(id: string): Promise<TipoBus | null>;
  findAll(): Promise<TipoBus[]>;
  save(tipoBus: Omit<TipoBus, 'id' | 'createdAt' | 'updatedAt'>): Promise<TipoBus>;
  update(id: string, data: Partial<TipoBus>): Promise<TipoBus>;
  delete(id: string): Promise<void>;
}
