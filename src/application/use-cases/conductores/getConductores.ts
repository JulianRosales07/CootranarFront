import type { ConductorRepository } from '../../../domain/repositories/ConductorRepository';
import type { Conductor } from '../../../domain/entities/Conductor';

export const getConductores = async (repository: ConductorRepository): Promise<Conductor[]> => {
  return await repository.findAll();
};
