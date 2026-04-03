import type { EmpleadoEncomiendaRepository } from '../../../domain/repositories/EmpleadoEncomiendaRepository';
import type { EmpleadoEncomienda } from '../../../domain/entities/EmpleadoEncomienda';

export const getEmpleadosEncomiendas = async (repository: EmpleadoEncomiendaRepository): Promise<EmpleadoEncomienda[]> => {
  return await repository.findActivos();
};
