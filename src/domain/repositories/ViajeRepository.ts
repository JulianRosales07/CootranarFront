import type { Viaje } from '../entities/Viaje';

export interface ViajeRepository {
  findById(id: string): Promise<Viaje | null>;
  findAll(): Promise<Viaje[]>;
  save(viaje: Omit<Viaje, 'id' | 'createdAt' | 'updatedAt'>): Promise<Viaje>;
  update(id: string, data: Partial<Viaje>): Promise<Viaje>;
  delete(id: string): Promise<void>;
}
