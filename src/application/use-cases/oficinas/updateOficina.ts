import type { OficinaRepository } from '../../../domain/repositories/OficinaRepository';
import type { Oficina } from '../../../domain/entities/Oficina';

export const updateOficina = async (
  repository: OficinaRepository,
  id: string,
  data: Partial<Oficina>
): Promise<Oficina> => {
  return await repository.update(id, data);
};
