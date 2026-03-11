import type { AgenciaRepository } from '../../../domain/repositories/AgenciaRepository';
import type { Agencia } from '../../../domain/entities/Agencia';

export const getAgencias = async (repository: AgenciaRepository): Promise<Agencia[]> => {
  return await repository.findAll();
};
