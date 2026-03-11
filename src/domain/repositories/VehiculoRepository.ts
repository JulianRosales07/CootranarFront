import type { Vehiculo } from '../entities/Vehiculo';

export interface VehiculoRepository {
  findById(id: string): Promise<Vehiculo | null>;
  findAll(): Promise<Vehiculo[]>;
  save(vehiculo: Omit<Vehiculo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehiculo>;
  update(id: string, data: Partial<Vehiculo>): Promise<Vehiculo>;
  delete(id: string): Promise<void>;
}
