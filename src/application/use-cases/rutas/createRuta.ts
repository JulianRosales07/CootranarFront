import type { RutaRepository } from '../../../domain/repositories/RutaRepository';
import type { Ruta } from '../../../domain/entities/Ruta';

export const createRuta = async (
  repository: RutaRepository,
  data: Omit<Ruta, 'id'>
): Promise<Ruta> => {
  return await repository.save(data);
};
