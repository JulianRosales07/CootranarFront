import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiTipoBusRepository } from '../../infrastructure/repositories/ApiTipoBusRepository';
import type { TipoBus } from '../../domain/entities/TipoBus';

const repository = new ApiTipoBusRepository();

export const useTiposBus = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tiposBus'],
    queryFn: () => repository.findAll(),
  });

  const create = useMutation({
    mutationFn: (data: Omit<TipoBus, 'id' | 'activo'>) => repository.save(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposBus'] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TipoBus> }) => repository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposBus'] });
    },
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposBus'] });
    },
  });

  const activate = useMutation({
    mutationFn: (id: string) => repository.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposBus'] });
    },
  });

  return {
    tiposBus: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    create,
    update,
    deactivate,
    activate,
  };
};
