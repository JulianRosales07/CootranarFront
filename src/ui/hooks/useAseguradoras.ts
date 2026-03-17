import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiAseguradoraRepository } from '../../infrastructure/repositories/ApiAseguradoraRepository';
import type { Aseguradora } from '../../domain/entities/Aseguradora';

const repository = new ApiAseguradoraRepository();

export const useAseguradoras = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['aseguradoras'],
    queryFn: () => repository.findAll(),
  });

  const create = useMutation({
    mutationFn: (data: Omit<Aseguradora, 'id' | 'activo'>) => repository.save(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aseguradoras'] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Aseguradora> }) => repository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aseguradoras'] });
    },
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aseguradoras'] });
    },
  });

  const activate = useMutation({
    mutationFn: (id: string) => repository.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aseguradoras'] });
    },
  });

  return {
    aseguradoras: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    create,
    update,
    deactivate,
    activate,
  };
};
