import type { VehiculoRepository } from '../../../domain/repositories/VehiculoRepository';
import type { Vehiculo } from '../../../domain/entities/Vehiculo';

export const createVehiculo = async (
  repository: VehiculoRepository,
  data: Omit<Vehiculo, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Vehiculo> => {
  return await repository.save(data);
};
