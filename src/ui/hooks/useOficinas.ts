import { useQuery } from '@tanstack/react-query';
import { ApiOficinaRepository } from '../../infrastructure/repositories/ApiOficinaRepository';
import { getOficinas } from '../../application/use-cases/oficinas/getOficinas';

const repository = new ApiOficinaRepository();

export const useOficinas = () => {
  const { data: oficinas, isLoading, error } = useQuery({
    queryKey: ['oficinas'],
    queryFn: () => getOficinas(repository),
  });

  return {
    oficinas,
    isLoading,
    error,
  };
};
