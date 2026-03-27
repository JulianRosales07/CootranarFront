import type { ConductorRepository } from '../../../domain/repositories/ConductorRepository';

export const deleteConductor = async (
  repository: ConductorRepository,
  id: string
): Promise<void> => {
  return await repository.delete(id);
};
