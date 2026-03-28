import type { TaquilleroRepository, CreateTaquilleroData } from '../../../domain/repositories/TaquilleroRepository';
import type { Taquillero } from '../../../domain/entities/Taquillero';

export const createTaquillero = async (
  repository: TaquilleroRepository,
  data: CreateTaquilleroData,
): Promise<Taquillero> => {
  return await repository.create(data);
};
