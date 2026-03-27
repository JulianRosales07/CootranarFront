import type { ConductorRepository } from '../../../domain/repositories/ConductorRepository';
import type { Conductor } from '../../../domain/entities/Conductor';

export const updateConductor = async (
  repository: ConductorRepository,
  id: string,
  data: Partial<Conductor> | FormData
): Promise<Conductor> => {
  return await repository.update(id, data);
};
