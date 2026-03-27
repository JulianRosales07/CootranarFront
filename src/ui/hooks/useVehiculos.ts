import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiVehiculoRepository } from '../../infrastructure/repositories/ApiVehiculoRepository';
import { getVehiculos } from '../../application/use-cases/vehiculos/getVehiculos';
import { createVehiculo } from '../../application/use-cases/vehiculos/createVehiculo';
import { updateVehiculo } from '../../application/use-cases/vehiculos/updateVehiculo';
import { deleteVehiculo } from '../../application/use-cases/vehiculos/deleteVehiculo';
import type { Vehiculo } from '../../domain/entities/Vehiculo';

const repository = new ApiVehiculoRepository();

export const useVehiculos = () => {
  const queryClient = useQueryClient();

  const { data: vehiculos, isLoading, error } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: () => getVehiculos(repository),
  });

  const create = useMutation({
    mutationFn: (data: Omit<Vehiculo, 'id' | 'createdAt' | 'updatedAt'>) =>
      createVehiculo(repository, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehiculos'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vehiculo> }) =>
      updateVehiculo(repository, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehiculos'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteVehiculo(repository, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehiculos'] }),
  });

  return {
    vehiculos,
    isLoading,
    error,
    create,
    update,
    remove,
  };
};
