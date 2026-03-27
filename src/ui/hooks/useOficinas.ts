import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiOficinaRepository } from '../../infrastructure/repositories/ApiOficinaRepository';
import { getOficinas } from '../../application/use-cases/oficinas/getOficinas';
import { createOficina } from '../../application/use-cases/oficinas/createOficina';
import { updateOficina } from '../../application/use-cases/oficinas/updateOficina';
import { deleteOficina } from '../../application/use-cases/oficinas/deleteOficina';
import type { Oficina } from '../../domain/entities/Oficina';

const repository = new ApiOficinaRepository();

export const useOficinas = () => {
  const queryClient = useQueryClient();

  const { data: oficinas, isLoading, error } = useQuery({
    queryKey: ['oficinas'],
    queryFn: () => getOficinas(repository),
  });

  const create = useMutation({
    mutationFn: (data: Omit<Oficina, 'id' | 'createdAt' | 'updatedAt'>) =>
      createOficina(repository, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oficinas'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Oficina> }) =>
      updateOficina(repository, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oficinas'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteOficina(repository, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oficinas'] }),
  });

  return {
    oficinas,
    isLoading,
    error,
    create,
    update,
    remove,
  };
};
