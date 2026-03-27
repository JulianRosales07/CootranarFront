import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiRutaRepository } from '../../infrastructure/repositories/ApiRutaRepository';
import { getRutas } from '../../application/use-cases/rutas/getRutas';
import { createRuta } from '../../application/use-cases/rutas/createRuta';
import { updateRuta } from '../../application/use-cases/rutas/updateRuta';
import { deleteRuta } from '../../application/use-cases/rutas/deleteRuta';
import type { Ruta } from '../../domain/entities/Ruta';

const repository = new ApiRutaRepository();

export const useRutas = () => {
  const queryClient = useQueryClient();

  const { data: rutas, isLoading, error } = useQuery({
    queryKey: ['rutas'],
    queryFn: () => getRutas(repository),
  });

  const create = useMutation({
    mutationFn: (data: Omit<Ruta, 'id'>) => createRuta(repository, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rutas'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Ruta> }) =>
      updateRuta(repository, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rutas'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRuta(repository, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rutas'] }),
  });

  return { rutas, isLoading, error, create, update, remove };
};
