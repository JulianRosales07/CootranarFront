import { useQuery } from '@tanstack/react-query';
import { empleadosEncomiendasApi } from '../../infrastructure/services/empleadosEncomiendasApi';
import { useAuth } from './useAuth';

/**
 * Resuelve la oficina de encomiendas asignada al empleado autenticado
 * (oficina origen para registro directo y cotización).
 */
export const useMiOficinaEncomienda = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['mi-oficina-encomienda', user?.idusuario],
    enabled: !!user?.idusuario,
    queryFn: async () => {
      const response = await empleadosEncomiendasApi.obtenerPorId(String(user!.idusuario));
      const empleado = response.data.data?.empleadoEncomienda;
      return {
        idOficina: empleado?.idoficinaencomienda ? String(empleado.idoficinaencomienda) : '',
        nombreOficina: empleado?.nombreoficina || empleado?.direccionoficina || '',
      };
    },
  });

  return {
    idOficinaOrigen: data?.idOficina || '',
    nombreOficinaOrigen: data?.nombreOficina || '',
    isLoading,
  };
};
