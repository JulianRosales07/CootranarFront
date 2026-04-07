import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tarifasRutaApi } from '../../infrastructure/services/tarifasRutaApi';
import type { TarifaRuta } from '../../domain/entities/TarifaRuta';

export const useTarifasRuta = (idRuta?: string) => {
  const queryClient = useQueryClient();

  const { data: tarifas, isLoading, error } = useQuery({
    queryKey: ['tarifas-ruta', idRuta],
    queryFn: async () => {
      if (!idRuta) return [];
      const response = await tarifasRutaApi.obtenerPorRuta(idRuta);
      const data = response.data.data;
      const tarifasArray = data.tarifas || data || [];
      
      return tarifasArray.map((tarifa: any) => ({
        id: String(tarifa.idtarifaruta ?? tarifa.id),
        idRuta: String(tarifa.idruta ?? tarifa.idRuta ?? ''),
        idTipoBus: String(tarifa.idtipobus ?? tarifa.idTipoBus ?? ''),
        piso: Number(tarifa.piso ?? 1),
        valorNormal: Number(tarifa.valornormal ?? tarifa.valorNormal ?? 0),
        valorTraficoAlto: Number(tarifa.valortraficoalto ?? tarifa.valorTraficoAlto ?? 0),
        adicionalPoltrona: tarifa.adicionalpoltrona !== undefined ? Number(tarifa.adicionalpoltrona) : 0,
        activo: tarifa.activo ?? true,
        rutaNombre: tarifa.nombreruta ?? tarifa.rutaNombre,
        tipoBusNombre: tarifa.nombretipobus ?? tarifa.tipoBusNombre,
      }));
    },
    enabled: !!idRuta,
  });

  const create = useMutation({
    mutationFn: (data: any) => tarifasRutaApi.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarifas-ruta'] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      tarifasRutaApi.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarifas-ruta'] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => tarifasRutaApi.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarifas-ruta'] });
    },
  });

  return {
    tarifas: tarifas || [],
    isLoading,
    error,
    create,
    update,
    remove,
  };
};
