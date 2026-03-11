import type { RutaRepository } from '../../../domain/repositories/RutaRepository';
import type { Ruta } from '../../../domain/entities/Ruta';

export const getRutas = async (repository: RutaRepository): Promise<Ruta[]> => {
  return await repository.findAll();
};
