import { useQuery } from '@tanstack/react-query';
import { ApiDepartamentoRepository } from '../../infrastructure/repositories/ApiDepartamentoRepository';
import { getDepartamentos } from '../../application/use-cases/departamentos/getDepartamentos';

const repository = new ApiDepartamentoRepository();

export const useDepartamentos = () => {
  const { data: departamentos, isLoading, error } = useQuery({
    queryKey: ['departamentos'],
    queryFn: () => getDepartamentos(repository),
  });

  return { departamentos, isLoading, error };
};
