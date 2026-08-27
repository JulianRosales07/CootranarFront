import type { TarifaEncomiendaRepository } from '../../../domain/repositories/TarifaEncomiendaRepository';
import type { TarifaEncomienda } from '../../../domain/entities/TarifaEncomienda';

export const getTarifasEncomiendas = async (
  repository: TarifaEncomiendaRepository,
  params: Record<string, any> = {}
): Promise<{ tarifas: TarifaEncomienda[]; paginacion?: any }> => {
  return await repository.listar(params);
};
