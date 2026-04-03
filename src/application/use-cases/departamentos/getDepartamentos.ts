import type { DepartamentoRepository } from '../../../domain/repositories/DepartamentoRepository';
import type { Departamento } from '../../../domain/entities/Departamento';

export const getDepartamentos = async (repository: DepartamentoRepository): Promise<Departamento[]> => {
  return await repository.findAll();
};

export const getDepartamentosActivos = async (repository: DepartamentoRepository): Promise<Departamento[]> => {
  return await repository.findActivos();
};
