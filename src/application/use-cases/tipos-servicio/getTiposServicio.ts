import type { TipoServicioRepository } from '../../../domain/repositories/TipoServicioRepository';
import type { TipoServicio } from '../../../domain/entities/TipoServicio';

export const getTiposServicio = async (repository: TipoServicioRepository): Promise<TipoServicio[]> => {
  return await repository.findAll();
};
