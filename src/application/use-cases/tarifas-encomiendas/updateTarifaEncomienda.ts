import type { TarifaEncomiendaRepository } from '../../../domain/repositories/TarifaEncomiendaRepository';
import type { TarifaEncomienda } from '../../../domain/entities/TarifaEncomienda';

export const updateTarifaEncomienda = async (
  repository: TarifaEncomiendaRepository,
  id: number,
  datos: { valorBase: number; idOficinaOrigen?: number; idOficinaDestino?: number }
): Promise<TarifaEncomienda> => {
  return await repository.actualizar(id, datos);
};
