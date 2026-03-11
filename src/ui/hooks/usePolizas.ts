import { useQuery } from '@tanstack/react-query';
import { ApiPolizaRepository } from '../../infrastructure/repositories/ApiPolizaRepository';
import { getPolizas } from '../../application/use-cases/polizas/getPolizas';

const repository = new ApiPolizaRepository();

export const usePolizas = () => {
  const { data: polizas, isLoading, error } = useQuery({
    queryKey: ['polizas'],
    queryFn: () => getPolizas(repository),
  });

  return {
    polizas,
    isLoading,
    error,
  };
};
