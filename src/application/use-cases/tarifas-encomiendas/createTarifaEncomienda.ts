import type { TarifaEncomiendaRepository } from '../../../domain/repositories/TarifaEncomiendaRepository';
import type { TarifaEncomienda } from '../../../domain/entities/TarifaEncomienda';

export const createTarifaEncomienda = async (
  repository: TarifaEncomiendaRepository,
  datos: { idOficinaOrigen: number; idOficinaDestino: number; valorBase: number }
): Promise<TarifaEncomienda> => {
  return await repository.crear(datos);
};
