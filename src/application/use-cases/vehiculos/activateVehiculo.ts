import type { VehiculoRepository } from '../../../domain/repositories/VehiculoRepository';

export const activateVehiculo = async (
  repository: VehiculoRepository,
  id: string
): Promise<void> => {
  return await repository.activar(id);
};
