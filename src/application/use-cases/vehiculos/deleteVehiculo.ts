import type { VehiculoRepository } from '../../../domain/repositories/VehiculoRepository';

export const deleteVehiculo = async (
  repository: VehiculoRepository,
  id: string
): Promise<void> => {
  return await repository.delete(id);
};
