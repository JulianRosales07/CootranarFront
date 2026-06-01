import type { ConductorRepository } from '../../../domain/repositories/ConductorRepository';

export const activateConductor = async (
  repository: ConductorRepository,
  id: string
): Promise<void> => {
  return await repository.activate(id);
};
