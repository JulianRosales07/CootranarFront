import { useQuery } from '@tanstack/react-query';
import { ApiTipoServicioRepository } from '../../infrastructure/repositories/ApiTipoServicioRepository';
import { getTiposServicio } from '../../application/use-cases/tipos-servicio/getTiposServicio';

const repository = new ApiTipoServicioRepository();

export const useTiposServicio = () => {
  const { data: tiposServicio, isLoading, error } = useQuery({
    queryKey: ['tiposServicio'],
    queryFn: () => getTiposServicio(repository),
  });

  return {
    tiposServicio,
    isLoading,
    error,
  };
};
