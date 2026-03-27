import type { RutaRepository } from '../../../domain/repositories/RutaRepository';
import type { Ruta } from '../../../domain/entities/Ruta';

export const updateRuta = async (
  repository: RutaRepository,
  id: string,
  data: Partial<Ruta>
): Promise<Ruta> => {
  return await repository.update(id, data);
};
