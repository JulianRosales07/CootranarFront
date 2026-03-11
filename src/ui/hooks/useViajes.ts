import { useQuery } from '@tanstack/react-query';
import { ApiViajeRepository } from '../../infrastructure/repositories/ApiViajeRepository';
import { getViajes } from '../../application/use-cases/viajes/getViajes';

const repository = new ApiViajeRepository();

export const useViajes = () => {
  const { data: viajes, isLoading, error } = useQuery({
    queryKey: ['viajes'],
    queryFn: () => getViajes(repository),
  });

  return {
    viajes,
    isLoading,
    error,
  };
};
