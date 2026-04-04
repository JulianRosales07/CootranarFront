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
      
      // Mapear campos del backend al frontend
      return tarifasArray.map((tarifa: any) => ({
        id: tarifa.idtarifaruta,
        idRuta: tarifa.idruta,
        idTipoBus: tarifa.idtipobus,
        tipoBusNombre: tarifa.nombretipobus,
        precio: tarifa.valornormal,
        precioTraficoAlto: tarifa.valortraficoalto,
        piso: tarifa.piso,
        activo: tarifa.activo !== false
      }));
    },
    enabled: !!idRuta,
  });

  const create = useMutation({
    mutationFn: async (data: any) => {
      const response = await tarifasRutaApi.crear(data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tarifas-ruta'] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await tarifasRutaApi.actualizar(id, data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tarifas-ruta'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const response = await tarifasRutaApi.eliminar(id);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tarifas-ruta'] }),
  });

  return { tarifas, isLoading, error, create, update, remove };
};
