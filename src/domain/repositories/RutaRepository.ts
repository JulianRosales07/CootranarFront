import type { Ruta } from '../entities/Ruta';

export interface RutaRepository {
  findById(id: string): Promise<Ruta | null>;
  findAll(): Promise<Ruta[]>;
  findActivas(): Promise<Ruta[]>;
  save(ruta: Omit<Ruta, 'id'>): Promise<Ruta>;
  update(id: string, data: Partial<Ruta>): Promise<Ruta>;
  delete(id: string): Promise<void>;
}
