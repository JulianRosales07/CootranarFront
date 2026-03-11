import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiRutaRepository } from '../../infrastructure/repositories/ApiRutaRepository';
import { getRutas } from '../../application/use-cases/rutas/getRutas';
import { createRuta } from '../../application/use-cases/rutas/createRuta';
import type { Ruta } from '../../domain/entities/Ruta';

const repository = new ApiRutaRepository();

export const useRutas = () => {
  const queryClient = useQueryClient();

  const { data: rutas, isLoading, error } = useQuery({
    queryKey: ['rutas'],
    queryFn: () => getRutas(repository),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Ruta, 'id'>) => createRuta(repository, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rutas'] });
    },
  });

  return {
    rutas,
    isLoading,
    error,
    createRuta: createMutation.mutate,
  };
};
