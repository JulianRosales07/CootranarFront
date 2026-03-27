import type { ConductorRepository } from '../../../domain/repositories/ConductorRepository';
import type { Conductor } from '../../../domain/entities/Conductor';

export const createConductor = async (
  repository: ConductorRepository,
  data: Omit<Conductor, 'id' | 'createdAt' | 'updatedAt'> | FormData
): Promise<Conductor> => {
  return await repository.save(data);
};
