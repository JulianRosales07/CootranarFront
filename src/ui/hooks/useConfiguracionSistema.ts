import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configuracionSistemaApi } from '../../infrastructure/services/configuracionSistemaApi';

export const ESTADOS_PRECIO = {
  NORMAL: 'NORMAL',
  TRAFICO_ALTO: 'TRAFICO_ALTO'
} as const;

export type EstadoPrecio = typeof ESTADOS_PRECIO[keyof typeof ESTADOS_PRECIO];

export const useConfiguracionSistema = () => {
  const queryClient = useQueryClient();

  const { data: estadoPrecio, isLoading, error } = useQuery({
    queryKey: ['configuracion-sistema', 'estado-precio-global'],
    queryFn: async () => {
      const response = await configuracionSistemaApi.obtenerEstadoPrecioGlobal();
      return response.data.data.estado as EstadoPrecio;
    },
  });

  const cambiarEstado = useMutation({
    mutationFn: async (nuevoEstado: EstadoPrecio) => {
      const response = await configuracionSistemaApi.cambiarEstadoPrecioGlobal(nuevoEstado);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracion-sistema'] });
      queryClient.invalidateQueries({ queryKey: ['rutas'] });
    },
  });

  return { 
    estadoPrecio, 
    isLoading, 
    error, 
    cambiarEstado,
    esTraficoAlto: estadoPrecio === ESTADOS_PRECIO.TRAFICO_ALTO,
    esNormal: estadoPrecio === ESTADOS_PRECIO.NORMAL
  };
};
