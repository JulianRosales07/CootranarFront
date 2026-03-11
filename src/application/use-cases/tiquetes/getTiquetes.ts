import type { TiqueteRepository } from '@/domain/repositories/TiqueteRepository';
import type { Tiquete, EstadoTiquete } from '@/domain/entities/Tiquete';

export const getTiquetes = async (
  repo: TiqueteRepository,
  estado?: EstadoTiquete,
): Promise<Tiquete[]> => {
  if (estado) {
    return repo.findByEstado(estado);
  }
  return repo.findAll();
};
