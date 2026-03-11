import type { CiudadRepository } from '../../../domain/repositories/CiudadRepository';

export const deleteCiudad = async (
  repository: CiudadRepository,
  id: string
): Promise<void> => {
  return await repository.delete(id);
};
