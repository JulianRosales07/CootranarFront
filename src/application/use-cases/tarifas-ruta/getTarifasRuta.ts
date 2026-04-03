import type { TarifaRutaRepository } from '../../../domain/repositories/TarifaRutaRepository';
import type { TarifaRuta } from '../../../domain/entities/TarifaRuta';

export const getTarifasByRuta = async (repository: TarifaRutaRepository, idRuta: string): Promise<TarifaRuta[]> => {
  return await repository.findByRuta(idRuta);
};
