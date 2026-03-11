import type { AgenciaRepository } from '../../../domain/repositories/AgenciaRepository';
import type { Agencia } from '../../../domain/entities/Agencia';

export const updateAgencia = async (
  repository: AgenciaRepository,
  id: string,
  data: Partial<Agencia>
): Promise<Agencia> => {
  return await repository.update(id, data);
};
