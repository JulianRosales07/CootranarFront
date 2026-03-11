import type { CiudadRepository } from '../../../domain/repositories/CiudadRepository';
import type { Ciudad } from '../../../domain/entities/Ciudad';

export const updateCiudad = async (
  repository: CiudadRepository,
  id: string,
  data: Partial<Ciudad>
): Promise<Ciudad> => {
  return await repository.update(id, data);
};
