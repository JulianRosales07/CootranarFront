import type { Ciudad } from '../entities/Ciudad';

export interface CiudadRepository {
  findById(id: string): Promise<Ciudad | null>;
  findAll(): Promise<Ciudad[]>;
  save(ciudad: Omit<Ciudad, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ciudad>;
  update(id: string, data: Partial<Ciudad>): Promise<Ciudad>;
  delete(id: string): Promise<void>;
}
