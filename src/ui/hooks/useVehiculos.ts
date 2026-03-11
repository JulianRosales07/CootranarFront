import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiVehiculoRepository } from '../../infrastructure/repositories/ApiVehiculoRepository';
import { getVehiculos } from '../../application/use-cases/vehiculos/getVehiculos';
import { createVehiculo } from '../../application/use-cases/vehiculos/createVehiculo';
import type { Vehiculo } from '../../domain/entities/Vehiculo';

const repository = new ApiVehiculoRepository();

export const useVehiculos = () => {
  const queryClient = useQueryClient();

  const { data: vehiculos, isLoading, error } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: () => getVehiculos(repository),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Vehiculo, 'id' | 'createdAt' | 'updatedAt'>) => createVehiculo(repository, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
    },
  });

  return {
    vehiculos,
    isLoading,
    error,
    createVehiculo: createMutation.mutate,
  };
};
