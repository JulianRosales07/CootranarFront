import type { OficinaRepository } from '../../../domain/repositories/OficinaRepository';
import type { Oficina } from '../../../domain/entities/Oficina';

export const getOficinas = async (repository: OficinaRepository): Promise<Oficina[]> => {
  return await repository.findAll();
};
