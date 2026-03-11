import type { AgenciaRepository } from '../../../domain/repositories/AgenciaRepository';
import type { Agencia } from '../../../domain/entities/Agencia';

export const createAgencia = async (
  repository: AgenciaRepository,
  data: Omit<Agencia, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Agencia> => {
  return await repository.save(data);
};
