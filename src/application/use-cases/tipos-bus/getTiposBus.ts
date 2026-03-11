import type { TipoBusRepository } from '../../../domain/repositories/TipoBusRepository';
import type { TipoBus } from '../../../domain/entities/TipoBus';

export const getTiposBus = async (repository: TipoBusRepository): Promise<TipoBus[]> => {
  return await repository.findAll();
};
