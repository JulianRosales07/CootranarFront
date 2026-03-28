import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiTaquilleroRepository } from '../../infrastructure/repositories/ApiTaquilleroRepository';
import { getTaquilleros } from '../../application/use-cases/taquilleros/getTaquilleros';
import { createTaquillero } from '../../application/use-cases/taquilleros/createTaquillero';
import { updateTaquillero } from '../../application/use-cases/taquilleros/updateTaquillero';
import { activarTaquillero } from '../../application/use-cases/taquilleros/activarTaquillero';
import type { CreateTaquilleroData, UpdateTaquilleroData } from '../../domain/repositories/TaquilleroRepository';

const repository = new ApiTaquilleroRepository();

export const useTaquilleros = () => {
  const queryClient = useQueryClient();

  const { data: taquilleros, isLoading, error } = useQuery({
    queryKey: ['taquilleros'],
    queryFn: () => getTaquilleros(repository),
  });

  const create = useMutation({
    mutationFn: (data: CreateTaquilleroData) => createTaquillero(repository, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taquilleros'] }),
  });

  const update = useMutation({
    mutationFn: ({ idusuario, data }: { idusuario: number; data: UpdateTaquilleroData }) =>
      updateTaquillero(repository, idusuario, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taquilleros'] }),
  });

  const activar = useMutation({
    mutationFn: (idusuario: number) => activarTaquillero(repository, idusuario),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taquilleros'] }),
  });

  return {
    taquilleros,
    isLoading,
    error,
    create,
    update,
    activar,
  };
};
