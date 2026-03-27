import type { OficinaRepository } from '../../../domain/repositories/OficinaRepository';

export const deleteOficina = async (
  repository: OficinaRepository,
  id: string
): Promise<void> => {
  return await repository.delete(id);
};
