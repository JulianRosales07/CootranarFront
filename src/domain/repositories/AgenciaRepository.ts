import type { Agencia } from '../entities/Agencia';

export interface AgenciaRepository {
  findById(id: string): Promise<Agencia | null>;
  findAll(): Promise<Agencia[]>;
  save(agencia: Omit<Agencia, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agencia>;
  update(id: string, data: Partial<Agencia>): Promise<Agencia>;
  delete(id: string): Promise<void>;
}
