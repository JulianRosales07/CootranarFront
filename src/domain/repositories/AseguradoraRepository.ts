import type { Aseguradora } from '../entities/Aseguradora';

export interface AseguradoraRepository {
  findById(id: string): Promise<Aseguradora | null>;
  findAll(): Promise<Aseguradora[]>;
  save(aseguradora: Omit<Aseguradora, 'id' | 'activo'>): Promise<Aseguradora>;
  update(id: string, data: Partial<Aseguradora>): Promise<Aseguradora>;
  delete(id: string): Promise<void>;
  activate(id: string): Promise<void>;
}
