import { useQuery } from '@tanstack/react-query';
import { ApiTipoBusRepository } from '../../infrastructure/repositories/ApiTipoBusRepository';
import { getTiposBus } from '../../application/use-cases/tipos-bus/getTiposBus';

const repository = new ApiTipoBusRepository();

export const useTiposBus = () => {
  const { data: tiposBus, isLoading, error } = useQuery({
    queryKey: ['tiposBus'],
    queryFn: () => getTiposBus(repository),
  });

  return {
    tiposBus,
    isLoading,
    error,
  };
};
