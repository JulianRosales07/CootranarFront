import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { encomiendasApi } from '../../infrastructure/services/encomiendasApi';
import type { EncomiendaDTO, EstadoEncomienda } from '../../application/dto/EncomiendaDTO';

export type { EstadoEncomienda };

export const mapearEncomienda = (e: any): EncomiendaDTO => ({
  id: String(e.idencomienda),
  referencia: e.referenciaencomienda || '',
  idOficinaOrigen: e.idoficinaorigen ? String(e.idoficinaorigen) : '',
  idOficinaDestino: e.idoficinadestino ? String(e.idoficinadestino) : '',
  oficinaOrigenNombre: e.nombreoficinaorigen || '',
  oficinaDestinoNombre: e.nombreoficinadestino || '',
  nombreRemitente: e.nombreremitente || '',
  nombreEmpleado: e.nombreempleado || '',
  nombreDestinatario: e.nombredestinatario || '',
  documentoDestinatario: e.documentodestinatario || '',
  telefonoDestinatario: e.telefonodestinatario || '',
  direccionDestinatario: e.direcciondestinatario || '',
  contenidoDeclarado: e.contenidodeclarado || '',
  pesoEstimado: e.pesoestimado != null ? Number(e.pesoestimado) : null,
  volumenEstimado: e.volumenestimado != null ? Number(e.volumenestimado) : null,
  pesoReal: e.pesoreal != null ? Number(e.pesoreal) : null,
  volumenReal: e.volumenreal != null ? Number(e.volumenreal) : null,
  valorDeclarado: e.valordeclarado != null ? Number(e.valordeclarado) : 0,
  valorCobrado: e.valorcobrado != null ? Number(e.valorcobrado) : null,
  esDomicilio: e.esdomicilio ?? false,
  valorDomicilio: e.valordomicilio != null ? Number(e.valordomicilio) : 0,
  estado: (e.estado || 'COTIZADA') as EstadoEncomienda,
  fechaRegistro: e.fecharegistro || null,
  fechaDespacho: e.fechadespacho || null,
  fechaRecepcionDestino: e.fecharecepciondestino || null,
  fechaEntrega: e.fechaentrega || null,
});

interface FiltrosEncomiendas {
  estado?: string;
  busqueda?: string;
  page?: number;
  limit?: number;
}

export const useEncomiendas = (filtros: FiltrosEncomiendas = {}) => {
  const queryClient = useQueryClient();
  const { estado, busqueda, page = 1, limit = 10 } = filtros;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['encomiendas', estado, busqueda, page, limit],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      if (estado) params.estado = estado;
      if (busqueda) params.busqueda = busqueda;

      const response = await encomiendasApi.obtenerTodas(params);
      const data = response.data.data;
      const encomiendasArray = data.encomiendas || [];
      return {
        encomiendas: encomiendasArray.map(mapearEncomienda),
        paginacion: data.paginacion || null,
      };
    },
  });

  const cambiarEstado = useMutation({
    mutationFn: async ({
      id,
      accion,
      documentoRecibe,
      nombreRecibe,
      observaciones,
    }: {
      id: string;
      accion: 'CONFIRMAR_RECEPCION' | 'ENTREGAR' | 'DEVOLVER';
      documentoRecibe?: string;
      nombreRecibe?: string;
      observaciones?: string;
    }) => {
      const response = await encomiendasApi.cambiarEstado(id, {
        accion,
        documentoRecibe,
        nombreRecibe,
        observaciones,
      });
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['encomiendas'] }),
  });

  const registrarConPreinscripcion = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await encomiendasApi.registrar(data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['encomiendas'] }),
  });

  const registrarDirecta = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await encomiendasApi.registrar(data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['encomiendas'] }),
  });

  const eliminar = useMutation({
    mutationFn: async (id: string) => {
      const response = await encomiendasApi.eliminar(id);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['encomiendas'] }),
  });

  return {
    encomiendas: data?.encomiendas || [],
    paginacion: data?.paginacion || null,
    isLoading,
    error,
    refetch,
    cambiarEstado,
    registrarConPreinscripcion,
    registrarDirecta,
    eliminar,
  };
};

/**
 * Consulta el detalle completo de una encomienda por su id (acción "Ver").
 */
export const consultarEncomiendaPorId = async (id: string) => {
  const response = await encomiendasApi.obtenerPorId(id);
  const data = response.data.data;
  const encomienda = data?.encomienda || data;
  if (!encomienda) return null;
  return mapearEncomienda(encomienda);
};

/**
 * Calcula la cotización estimada en tiempo real (sin persistir nada).
 */
export const cotizarEncomienda = async (datos: {
  idOficinaOrigen: string;
  idOficinaDestino: string;
  pesoEstimado: string;
  volumenEstimado?: string;
  valorDeclarado?: string;
  esDomicilio?: boolean;
  valorDomicilio?: string;
}) => {
  const response = await encomiendasApi.cotizar({
    idOficinaOrigen: datos.idOficinaOrigen,
    idOficinaDestino: datos.idOficinaDestino,
    pesoEstimado: datos.pesoEstimado,
    volumenEstimado: datos.volumenEstimado || 1,
    valorDeclarado: datos.valorDeclarado || 0,
    esDomicilio: datos.esDomicilio || false,
    valorDomicilio: datos.valorDomicilio || 0,
  });
  return response.data.data.cotizacion as number;
};
