import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiConductorRepository } from '../../infrastructure/repositories/ApiConductorRepository';
import { getConductores } from '../../application/use-cases/conductores/getConductores';
import { createConductor } from '../../application/use-cases/conductores/createConductor';
import { updateConductor } from '../../application/use-cases/conductores/updateConductor';
import { deleteConductor } from '../../application/use-cases/conductores/deleteConductor';
import type { Conductor } from '../../domain/entities/Conductor';

const repository = new ApiConductorRepository();

export const useConductores = () => {
  const queryClient = useQueryClient();

  const { data: conductores, isLoading, error } = useQuery({
    queryKey: ['conductores'],
    queryFn: () => getConductores(repository),
  });

  const create = useMutation({
    mutationFn: (data: Omit<Conductor, 'id' | 'createdAt' | 'updatedAt'> | FormData) =>
      createConductor(repository, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conductores'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Conductor> | FormData }) =>
      updateConductor(repository, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conductores'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteConductor(repository, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conductores'] }),
  });

  return {
    conductores,
    isLoading,
    error,
    create,
    update,
    remove,
  };
};
