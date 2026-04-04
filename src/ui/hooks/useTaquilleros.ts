import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taquillerosApi } from '../../infrastructure/services/taquillerosApi';

export const useTaquilleros = () => {
  const queryClient = useQueryClient();

  const { data: taquilleros, isLoading, error } = useQuery({
    queryKey: ['taquilleros'],
    queryFn: async () => {
      const response = await taquillerosApi.obtenerTodos();
      const data = response.data.data;
      return data.taquilleros || data || [];
    },
  });

  const create = useMutation({
    mutationFn: async (data: any) => {
      const response = await taquillerosApi.crear(data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taquilleros'] }),
  });

  const update = useMutation({
    mutationFn: async ({ idusuario, data }: { idusuario: number; data: any }) => {
      const response = await taquillerosApi.actualizar(String(idusuario), data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taquilleros'] }),
  });

  const activar = useMutation({
    mutationFn: async (idusuario: number) => {
      const response = await taquillerosApi.activar(String(idusuario));
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taquilleros'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const response = await taquillerosApi.eliminar(id);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taquilleros'] }),
  });

  return {
    taquilleros,
    isLoading,
    error,
    create,
    update,
    activar,
    remove,
  };
};
