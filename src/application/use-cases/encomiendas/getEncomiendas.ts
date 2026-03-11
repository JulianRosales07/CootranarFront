import type { EncomiendaRepository } from '@/domain/repositories/EncomiendaRepository';
import type { Encomienda, EstadoEncomienda } from '@/domain/entities/Encomienda';

export const getEncomiendas = async (
  repo: EncomiendaRepository,
  estado?: EstadoEncomienda,
): Promise<Encomienda[]> => {
  if (estado) {
    return repo.findByEstado(estado);
  }
  return repo.findAll();
};
