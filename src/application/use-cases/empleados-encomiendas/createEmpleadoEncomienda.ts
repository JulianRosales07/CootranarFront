import type { EmpleadoEncomiendaRepository } from '../../../domain/repositories/EmpleadoEncomiendaRepository';
import type { EmpleadoEncomienda } from '../../../domain/entities/EmpleadoEncomienda';

export const createEmpleadoEncomienda = async (
  repository: EmpleadoEncomiendaRepository,
  data: Omit<EmpleadoEncomienda, 'id'>
): Promise<EmpleadoEncomienda> => {
  return await repository.save(data);
};
