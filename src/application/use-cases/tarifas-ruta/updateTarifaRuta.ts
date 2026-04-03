import type { TarifaRutaRepository } from '../../../domain/repositories/TarifaRutaRepository';
import type { TarifaRuta } from '../../../domain/entities/TarifaRuta';

export const updateTarifaRuta = async (
  repository: TarifaRutaRepository,
  id: string,
  data: Partial<TarifaRuta>
): Promise<TarifaRuta> => {
  return await repository.update(id, data);
};
