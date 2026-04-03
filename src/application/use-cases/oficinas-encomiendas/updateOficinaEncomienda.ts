import type { OficinaEncomiendaRepository } from '../../../domain/repositories/OficinaEncomiendaRepository';
import type { OficinaEncomienda } from '../../../domain/entities/OficinaEncomienda';

export const updateOficinaEncomienda = async (
  repository: OficinaEncomiendaRepository,
  id: string,
  data: Partial<OficinaEncomienda>
): Promise<OficinaEncomienda> => {
  return await repository.update(id, data);
};
