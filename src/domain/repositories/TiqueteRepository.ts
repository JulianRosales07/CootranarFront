import type { Tiquete, EstadoTiquete } from '../entities/Tiquete';

export interface TiqueteRepository {
  findById(id: string): Promise<Tiquete | null>;
  findAll(): Promise<Tiquete[]>;
  findByEstado(estado: EstadoTiquete): Promise<Tiquete[]>;
  save(tiquete: Omit<Tiquete, 'id' | 'createdAt'>): Promise<Tiquete>;
  update(id: string, data: Partial<Tiquete>): Promise<Tiquete>;
  delete(id: string): Promise<void>;
}
