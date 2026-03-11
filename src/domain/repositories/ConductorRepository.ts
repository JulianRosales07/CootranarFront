import type { Conductor } from '../entities/Conductor';

export interface ConductorRepository {
  findById(id: string): Promise<Conductor | null>;
  findAll(): Promise<Conductor[]>;
  save(conductor: Omit<Conductor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conductor>;
  update(id: string, data: Partial<Conductor>): Promise<Conductor>;
  delete(id: string): Promise<void>;
}
