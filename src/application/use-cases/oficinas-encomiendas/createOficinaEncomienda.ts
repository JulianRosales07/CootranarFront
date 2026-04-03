import type { OficinaEncomiendaRepository } from '../../../domain/repositories/OficinaEncomiendaRepository';
import type { OficinaEncomienda } from '../../../domain/entities/OficinaEncomienda';

export const createOficinaEncomienda = async (
  repository: OficinaEncomiendaRepository,
  data: Omit<OficinaEncomienda, 'id' | 'createdAt' | 'updatedAt'>
): Promise<OficinaEncomienda> => {
  return await repository.save(data);
};
