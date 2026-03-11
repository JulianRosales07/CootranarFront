import type { ViajeRepository } from '../../../domain/repositories/ViajeRepository';
import type { Viaje } from '../../../domain/entities/Viaje';

export const getViajes = async (repository: ViajeRepository): Promise<Viaje[]> => {
  return await repository.findAll();
};
