import type { OficinaEncomiendaRepository } from '../../../domain/repositories/OficinaEncomiendaRepository';

export const activarOficinaEncomienda = async (repository: OficinaEncomiendaRepository, id: string): Promise<void> => {
  return await repository.activar(id);
};

export const desactivarOficinaEncomienda = async (repository: OficinaEncomiendaRepository, id: string): Promise<void> => {
  return await repository.desactivar(id);
};
