import { useQuery } from '@tanstack/react-query';
import { ApiAseguradoraRepository } from '../../infrastructure/repositories/ApiAseguradoraRepository';
import { getAseguradoras } from '../../application/use-cases/aseguradoras/getAseguradoras';

const repository = new ApiAseguradoraRepository();

export const useAseguradoras = () => {
  const { data: aseguradoras, isLoading, error } = useQuery({
    queryKey: ['aseguradoras'],
    queryFn: () => getAseguradoras(repository),
  });

  return {
    aseguradoras,
    isLoading,
    error,
  };
};
