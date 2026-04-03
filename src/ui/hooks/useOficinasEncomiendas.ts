import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiOficinaEncomiendaRepository } from '../../infrastructure/repositories/ApiOficinaEncomiendaRepository';
import { getOficinasEncomiendas } from '../../application/use-cases/oficinas-encomiendas/getOficinasEncomiendas';
import { createOficinaEncomienda } from '../../application/use-cases/oficinas-encomiendas/createOficinaEncomienda';
import { updateOficinaEncomienda } from '../../application/use-cases/oficinas-encomiendas/updateOficinaEncomienda';
import { activarOficinaEncomienda, desactivarOficinaEncomienda } from '../../application/use-cases/oficinas-encomiendas/toggleOficinaEncomienda';
import type { OficinaEncomienda } from '../../domain/entities/OficinaEncomienda';

const repository = new ApiOficinaEncomiendaRepository();

export const useOficinasEncomiendas = () => {
  const queryClient = useQueryClient();

  const { data: oficinas, isLoading, error } = useQuery({
    queryKey: ['oficinas-encomiendas'],
    queryFn: () => getOficinasEncomiendas(repository),
  });

  const create = useMutation({
    mutationFn: (data: Omit<OficinaEncomienda, 'id' | 'createdAt' | 'updatedAt'>) =>
      createOficinaEncomienda(repository, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oficinas-encomiendas'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OficinaEncomienda> }) =>
      updateOficinaEncomienda(repository, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oficinas-encomiendas'] }),
  });

  const activar = useMutation({
    mutationFn: (id: string) => activarOficinaEncomienda(repository, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oficinas-encomiendas'] }),
  });

  const desactivar = useMutation({
    mutationFn: (id: string) => desactivarOficinaEncomienda(repository, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oficinas-encomiendas'] }),
  });

  return { oficinas, isLoading, error, create, update, activar, desactivar };
};
