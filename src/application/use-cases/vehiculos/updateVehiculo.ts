import type { VehiculoRepository } from '../../../domain/repositories/VehiculoRepository';
import type { Vehiculo } from '../../../domain/entities/Vehiculo';

export const updateVehiculo = async (
  repository: VehiculoRepository,
  id: string,
  data: Partial<Vehiculo>
): Promise<Vehiculo> => {
  return await repository.update(id, data);
};
