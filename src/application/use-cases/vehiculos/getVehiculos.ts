import type { VehiculoRepository } from '../../../domain/repositories/VehiculoRepository';
import type { Vehiculo } from '../../../domain/entities/Vehiculo';

export const getVehiculos = async (repository: VehiculoRepository): Promise<Vehiculo[]> => {
  return await repository.findAll();
};
