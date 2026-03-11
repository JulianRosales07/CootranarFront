import type { TiqueteRepository } from '@/domain/repositories/TiqueteRepository';
import type { UpdateTiqueteDTO } from '@/application/dto/TiqueteDTO';
import type { Tiquete } from '@/domain/entities/Tiquete';

export const updateTiquete = async (
  repo: TiqueteRepository,
  id: string,
  data: UpdateTiqueteDTO,
): Promise<Tiquete> => {
  return repo.update(id, data);
};
