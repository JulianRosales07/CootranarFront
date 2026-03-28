import type { TaquilleroRepository } from '../../../domain/repositories/TaquilleroRepository';
import type { Taquillero } from '../../../domain/entities/Taquillero';

export const getTaquilleros = async (repository: TaquilleroRepository): Promise<Taquillero[]> => {
  return await repository.findAll();
};
