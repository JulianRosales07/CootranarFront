import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajesApi } from '../../infrastructure/services/viajesApi';

export const useViajes = (filtro: 'todos' | 'activos' | 'inactivos' = 'todos', page = 1, busqueda = '') => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['viajes', filtro, page, busqueda],
    queryFn: async () => {
      const params = { page, limit: 10 };
      let response;
      
      if (busqueda.trim()) {
        response = await viajesApi.buscar(busqueda.trim(), params);
      } else if (filtro === 'activos') {
        response = await viajesApi.obtenerActivos(params);
      } else if (filtro === 'inactivos') {
        response = await viajesApi.obtenerInactivos(params);
      } else {
        response = await viajesApi.obtenerTodos(params);
      }
      
      return response.data.data;
    },
  });

  const crearMutation = useMutation({
    mutationFn: (data: any) => viajesApi.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => 
      viajesApi.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
    },
  });

  const activarMutation = useMutation({
    mutationFn: (id: string | number) => viajesApi.activar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
    },
  });

  const desactivarMutation = useMutation({
    mutationFn: (id: string | number) => viajesApi.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
    },
  });

  return {
    viajes: data?.viajes || [],
    paginacion: data?.paginacion || null,
    isLoading,
    error,
    refetch,
    crear: crearMutation,
    actualizar: actualizarMutation,
    activar: activarMutation,
    desactivar: desactivarMutation,
  };
};
