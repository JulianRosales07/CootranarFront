import type { RutaRepository } from '../../../domain/repositories/RutaRepository';

export const deleteRuta = async (
  repository: RutaRepository,
  id: string
): Promise<void> => {
  return await repository.delete(id);
};
