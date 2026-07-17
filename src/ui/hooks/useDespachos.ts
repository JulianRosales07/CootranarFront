import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { despachosApi } from '../../infrastructure/services/despachosApi';
import type { DespachoDTO, EstadoDespacho } from '../../application/dto/DespachoDTO';

export type { EstadoDespacho };

const mapearDespacho = (d: any): DespachoDTO => ({
  id: String(d.iddespacho),
  codigoDespacho: d.codigodespacho || '',
  idOficinaOrigen: d.idoficinaorigen ? String(d.idoficinaorigen) : '',
  idOficinaDestino: d.idoficinadestino ? String(d.idoficinadestino) : '',
  oficinaOrigenNombre: d.nombreoficinaorigen || '',
  oficinaDestinoNombre: d.nombreoficinadestino || '',
  idVehiculo: d.idvehiculo ? String(d.idvehiculo) : '',
  idConductor: d.idconductor ? String(d.idconductor) : '',
  placa: d.placa || '',
  nombreConductor: d.nombreconductor || '',
  estado: (d.estado || 'PROGRAMADO') as EstadoDespacho,
  fechaProgramada: d.fechaprogramada || null,
  fechaSalida: d.fechasalida || null,
  fechaLlegada: d.fechallegada || null,
  totalEncomiendas: d.totalencomiendas != null ? Number(d.totalencomiendas) : 0,
});

interface FiltrosDespachos {
  estado?: string;
  page?: number;
  limit?: number;
}

export const useDespachos = (filtros: FiltrosDespachos = {}) => {
  const queryClient = useQueryClient();
  const { estado, page = 1, limit = 10 } = filtros;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['despachos', estado, page, limit],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      if (estado) params.estado = estado;

      const response = await despachosApi.obtenerTodos(params);
      const data = response.data.data;
      const despachosArray = data.despachos || [];
      return {
        despachos: despachosArray.map(mapearDespacho),
        paginacion: data.paginacion || null,
      };
    },
  });

  const crear = useMutation({
    mutationFn: async (data: {
      idOficinaDestino: string;
      idVehiculo: string;
      idConductor: string;
      idsEncomienda: string[];
      fechaProgramada?: string;
    }) => {
      const response = await despachosApi.crear({
        idOficinaDestino: parseInt(data.idOficinaDestino, 10),
        idVehiculo: parseInt(data.idVehiculo, 10),
        idConductor: parseInt(data.idConductor, 10),
        idsEncomienda: data.idsEncomienda.map((id) => parseInt(id, 10)),
        fechaProgramada: data.fechaProgramada,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despachos'] });
      queryClient.invalidateQueries({ queryKey: ['encomiendas'] });
    },
  });

  const confirmarSalida = useMutation({
    mutationFn: async (id: string) => {
      const response = await despachosApi.confirmarSalida(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despachos'] });
      queryClient.invalidateQueries({ queryKey: ['encomiendas'] });
    },
  });

  const confirmarLlegada = useMutation({
    mutationFn: async (id: string) => {
      const response = await despachosApi.confirmarLlegada(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despachos'] });
      queryClient.invalidateQueries({ queryKey: ['encomiendas'] });
    },
  });

  return {
    despachos: data?.despachos || [],
    paginacion: data?.paginacion || null,
    isLoading,
    error,
    refetch,
    crear,
    confirmarSalida,
    confirmarLlegada,
  };
};
