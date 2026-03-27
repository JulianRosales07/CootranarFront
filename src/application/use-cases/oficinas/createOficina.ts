import type { OficinaRepository } from '../../../domain/repositories/OficinaRepository';
import type { Oficina } from '../../../domain/entities/Oficina';

export const createOficina = async (
  repository: OficinaRepository,
  data: Omit<Oficina, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Oficina> => {
  return await repository.save(data);
};
