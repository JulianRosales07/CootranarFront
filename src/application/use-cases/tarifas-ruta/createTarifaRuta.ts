import type { TarifaRutaRepository } from '../../../domain/repositories/TarifaRutaRepository';
import type { TarifaRuta } from '../../../domain/entities/TarifaRuta';

export const createTarifaRuta = async (
  repository: TarifaRutaRepository,
  data: Omit<TarifaRuta, 'id'>
): Promise<TarifaRuta> => {
  return await repository.save(data);
};
