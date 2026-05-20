import { useQuery } from '@tanstack/react-query';
import { rutasApi } from '../../infrastructure/services/rutasApi';

export interface CompletitudTarifas {
  requeridas: number;
  configuradas: number;
  porcentaje: number;
}

export const useCompletitudTarifas = (idRuta: string | null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['completitud-tarifas', idRuta],
    queryFn: async () => {
      if (!idRuta) return null;
      const response = await rutasApi.obtenerCompletitudTarifas(idRuta);
      const data = response.data.data;
      
      return {
        requeridas: Number(data.requeridas || 0),
        configuradas: Number(data.configuradas || 0),
        porcentaje: Number(data.porcentaje || 0),
      } as CompletitudTarifas;
    },
    enabled: !!idRuta,
  });

  return {
    completitud: data || null,
    isLoading,
    error,
  };
};
