import type { PolizaRepository } from '../../../domain/repositories/PolizaRepository';
import type { Poliza } from '../../../domain/entities/Poliza';

export const getPolizas = async (repository: PolizaRepository): Promise<Poliza[]> => {
  return await repository.findAll();
};
