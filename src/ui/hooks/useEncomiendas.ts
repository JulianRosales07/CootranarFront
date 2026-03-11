import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiEncomiendaRepository } from '../../infrastructure/repositories/ApiEncomiendaRepository';
import { getEncomiendas } from '../../application/use-cases/encomiendas/getEncomiendas';
import { createEncomienda } from '../../application/use-cases/encomiendas/createEncomienda';
import type { Encomienda } from '../../domain/entities/Encomienda';

const repository = new ApiEncomiendaRepository();

export const useEncomiendas = () => {
  const queryClient = useQueryClient();

  const { data: encomiendas, isLoading, error } = useQuery({
    queryKey: ['encomiendas'],
    queryFn: () => getEncomiendas(repository),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Encomienda, 'id' | 'createdAt'>) =>
      createEncomienda(repository, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encomiendas'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Encomienda> }) =>
      repository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encomiendas'] });
    },
  });

  return {
    encomiendas,
    isLoading,
    error,
    createEncomienda: createMutation.mutate,
    updateEncomienda: updateMutation.mutate,
  };
};
