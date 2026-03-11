import type { CiudadRepository } from '../../../domain/repositories/CiudadRepository';
import type { Ciudad } from '../../../domain/entities/Ciudad';

export const getCiudades = async (repository: CiudadRepository): Promise<Ciudad[]> => {
  return await repository.findAll();
};
