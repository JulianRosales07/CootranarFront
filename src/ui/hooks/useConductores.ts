import { useQuery } from '@tanstack/react-query';
import { ApiConductorRepository } from '../../infrastructure/repositories/ApiConductorRepository';
import { getConductores } from '../../application/use-cases/conductores/getConductores';

const repository = new ApiConductorRepository();

export const useConductores = () => {
  const { data: conductores, isLoading, error } = useQuery({
    queryKey: ['conductores'],
    queryFn: () => getConductores(repository),
  });

  return {
    conductores,
    isLoading,
    error,
  };
};
