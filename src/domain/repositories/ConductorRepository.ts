import type { Conductor } from '../entities/Conductor';

export interface ConductorRepository {
  findById(id: string): Promise<Conductor | null>;
  findAll(): Promise<Conductor[]>;
  save(conductor: Omit<Conductor, 'id' | 'createdAt' | 'updatedAt'> | FormData): Promise<Conductor>;
  update(id: string, data: Partial<Conductor> | FormData): Promise<Conductor>;
  delete(id: string): Promise<void>;
}
