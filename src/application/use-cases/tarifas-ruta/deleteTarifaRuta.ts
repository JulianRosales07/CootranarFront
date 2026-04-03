import type { TarifaRutaRepository } from '../../../domain/repositories/TarifaRutaRepository';

export const deleteTarifaRuta = async (repository: TarifaRutaRepository, id: string): Promise<void> => {
  return await repository.delete(id);
};
