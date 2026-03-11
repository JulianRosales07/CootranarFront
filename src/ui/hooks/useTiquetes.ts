import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiTiqueteRepository } from '../../infrastructure/repositories/ApiTiqueteRepository';
import { getTiquetes } from '../../application/use-cases/tiquetes/getTiquetes';
import { createTiquete } from '../../application/use-cases/tiquetes/createTiquete';
import { updateTiquete } from '../../application/use-cases/tiquetes/updateTiquete';
import type { Tiquete } from '../../domain/entities/Tiquete';

const repository = new ApiTiqueteRepository();

export const useTiquetes = () => {
  const queryClient = useQueryClient();

  const { data: tiquetes, isLoading, error } = useQuery({
    queryKey: ['tiquetes'],
    queryFn: () => getTiquetes(repository),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Tiquete, 'id' | 'createdAt'>) => createTiquete(repository, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiquetes'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tiquete> }) =>
      updateTiquete(repository, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiquetes'] });
    },
  });

  return {
    tiquetes,
    isLoading,
    error,
    createTiquete: createMutation.mutate,
    updateTiquete: updateMutation.mutate,
  };
};
