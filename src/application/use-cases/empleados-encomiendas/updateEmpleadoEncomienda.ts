import type { EmpleadoEncomiendaRepository } from '../../../domain/repositories/EmpleadoEncomiendaRepository';
import type { EmpleadoEncomienda } from '../../../domain/entities/EmpleadoEncomienda';

export const updateEmpleadoEncomienda = async (
  repository: EmpleadoEncomiendaRepository,
  id: string,
  data: Partial<EmpleadoEncomienda>
): Promise<EmpleadoEncomienda> => {
  return await repository.update(id, data);
};
