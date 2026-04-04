import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tiposServicioApi } from '../../infrastructure/services/tiposServicioApi';

export const useTiposServicio = () => {
  const queryClient = useQueryClient();

  const { data: tiposServicio, isLoading, error } = useQuery({
    queryKey: ['tiposServicio'],
    queryFn: async () => {
      const response = await tiposServicioApi.obtenerTodos();
      console.log('Response tipos servicio:', response.data);
      const data = response.data.data;
      return data.tiposservicio || data || [];
    },
  });

  const create = useMutation({
    mutationFn: async (data: any) => {
      const response = await tiposServicioApi.crear(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposServicio'] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await tiposServicioApi.actualizar(id, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposServicio'] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const response = await tiposServicioApi.eliminar(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposServicio'] });
    },
  });

  return {
    tiposServicio,
    isLoading,
    error,
    create,
    update,
    remove,
  };
};
