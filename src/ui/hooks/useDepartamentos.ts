import { useQuery } from '@tanstack/react-query';
import { departamentosApi } from '../../infrastructure/services/departamentosApi';

export const useDepartamentos = () => {
  const { data: departamentos, isLoading, error } = useQuery({
    queryKey: ['departamentos'],
    queryFn: async () => {
      const response = await departamentosApi.obtenerTodos();
      const data = response.data.data;
      return data.departamentos || data || [];
    },
  });

  return { departamentos, isLoading, error };
};
