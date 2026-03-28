import type { TaquilleroRepository, UpdateTaquilleroData } from '../../../domain/repositories/TaquilleroRepository';
import type { Taquillero } from '../../../domain/entities/Taquillero';

export const updateTaquillero = async (
  repository: TaquilleroRepository,
  idusuario: number,
  data: UpdateTaquilleroData,
): Promise<Taquillero> => {
  return await repository.update(idusuario, data);
};
