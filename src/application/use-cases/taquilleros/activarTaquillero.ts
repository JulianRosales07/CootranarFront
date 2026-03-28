import type { TaquilleroRepository } from '../../../domain/repositories/TaquilleroRepository';

export const activarTaquillero = async (
  repository: TaquilleroRepository,
  idusuario: number,
): Promise<void> => {
  return await repository.activar(idusuario);
};
