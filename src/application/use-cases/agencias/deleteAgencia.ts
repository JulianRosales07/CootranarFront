import type { AgenciaRepository } from '../../../domain/repositories/AgenciaRepository';

export const deleteAgencia = async (
  repository: AgenciaRepository,
  id: string
): Promise<void> => {
  return await repository.delete(id);
};
