import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiViajeRepository } from '../../infrastructure/repositories/ApiViajeRepository';

export const useViajes = (filtro: 'todos' | 'activos' | 'inactivos' = 'todos', page = 1, busqueda = '') => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['viajes', filtro, page, busqueda],
    queryFn: async () => {
      const params = { page, limit: 10 };
      let response;
      
      if (busqueda.trim()) {
        response = await apiViajeRepository.buscar(busqueda.trim(), params);
      } else if (filtro === 'activos') {
        response = await apiViajeRepository.obtenerActivos(params);
      } else if (filtro === 'inactivos') {
        response = await apiViajeRepository.obtenerInactivos(params);
      } else {
        response = await apiViajeRepository.obtenerTodos(params);
      }
      
      return response.data.data;
    },
  });

  const crearMutation = useMutation({
    mutationFn: (data: any) => apiViajeRepository.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => 
      apiViajeRepository.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
    },
  });

  const activarMutation = useMutation({
    mutationFn: (id: string | number) => apiViajeRepository.activar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
    },
  });

  const desactivarMutation = useMutation({
    mutationFn: (id: string | number) => apiViajeRepository.desactivar(id),
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
