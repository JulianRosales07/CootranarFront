import type { CiudadRepository } from '../../../domain/repositories/CiudadRepository';
import type { Ciudad } from '../../../domain/entities/Ciudad';

export const createCiudad = async (
  repository: CiudadRepository,
  data: Omit<Ciudad, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Ciudad> => {
  return await repository.save(data);
};
