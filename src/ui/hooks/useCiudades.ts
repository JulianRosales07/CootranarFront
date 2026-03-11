import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiCiudadRepository } from '../../infrastructure/repositories/ApiCiudadRepository';
import { getCiudades } from '../../application/use-cases/ciudades/getCiudades';
import { createCiudad } from '../../application/use-cases/ciudades/createCiudad';
import { updateCiudad } from '../../application/use-cases/ciudades/updateCiudad';
import { deleteCiudad } from '../../application/use-cases/ciudades/deleteCiudad';
import type { Ciudad } from '../../domain/entities/Ciudad';

const repository = new ApiCiudadRepository();

export const useCiudades = () => {
  const queryClient = useQueryClient();

  const { data: ciudades, isLoading, error } = useQuery({
    queryKey: ['ciudades'],
    queryFn: () => getCiudades(repository),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Ciudad, 'id' | 'createdAt' | 'updatedAt'>) => createCiudad(repository, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciudades'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Ciudad> }) =>
      updateCiudad(repository, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciudades'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCiudad(repository, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciudades'] });
    },
  });

  return {
    ciudades,
    isLoading,
    error,
    createCiudad: createMutation.mutate,
    updateCiudad: updateMutation.mutate,
    deleteCiudad: deleteMutation.mutate,
  };
};
