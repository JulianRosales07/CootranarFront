import type { OficinaEncomiendaRepository } from '../../../domain/repositories/OficinaEncomiendaRepository';
import type { OficinaEncomienda } from '../../../domain/entities/OficinaEncomienda';

export const getOficinasEncomiendas = async (repository: OficinaEncomiendaRepository): Promise<OficinaEncomienda[]> => {
  return await repository.findAll();
};

export const getOficinasEncomiendasActivas = async (repository: OficinaEncomiendaRepository): Promise<OficinaEncomienda[]> => {
  return await repository.findActivas();
};
