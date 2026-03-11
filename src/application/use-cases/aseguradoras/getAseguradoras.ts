import type { AseguradoraRepository } from '../../../domain/repositories/AseguradoraRepository';
import type { Aseguradora } from '../../../domain/entities/Aseguradora';

export const getAseguradoras = async (repository: AseguradoraRepository): Promise<Aseguradora[]> => {
  return await repository.findAll();
};
