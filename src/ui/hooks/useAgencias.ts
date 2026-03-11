import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiAgenciaRepository } from '../../infrastructure/repositories/ApiAgenciaRepository';
import { getAgencias } from '../../application/use-cases/agencias/getAgencias';
import { createAgencia } from '../../application/use-cases/agencias/createAgencia';
import { updateAgencia } from '../../application/use-cases/agencias/updateAgencia';
import { deleteAgencia } from '../../application/use-cases/agencias/deleteAgencia';
import type { Agencia } from '../../domain/entities/Agencia';

const repository = new ApiAgenciaRepository();

export const useAgencias = () => {
  const queryClient = useQueryClient();

  const { data: agencias, isLoading, error } = useQuery({
    queryKey: ['agencias'],
    queryFn: () => getAgencias(repository),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Agencia, 'id' | 'createdAt' | 'updatedAt'>) => createAgencia(repository, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencias'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Agencia> }) =>
      updateAgencia(repository, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencias'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAgencia(repository, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencias'] });
    },
  });

  return {
    agencias,
    isLoading,
    error,
    createAgencia: createMutation.mutate,
    updateAgencia: updateMutation.mutate,
    deleteAgencia: deleteMutation.mutate,
  };
};
