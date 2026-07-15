import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { encomiendasApi } from '../../infrastructure/services/encomiendasApi';

export type EstadoEncomienda = 'RECIBIDA' | 'EN_TRANSITO' | 'ENTREGADA' | 'DEVUELTA';

const mapearEncomienda = (e: any) => ({
  id: String(e.idencomienda),
  codigoReferencia: e.codigoreferencia || e.referencia || '',
  remitenteNombre: e.remitentenombre || '',
  remitenteDocumento: e.remitentedocumento || '',
  remitenteTelefono: e.remitentetelefono || '',
  destinatarioNombre: e.destinatarionombre || '',
  destinatarioDocumento: e.destinatariodocumento || '',
  destinatarioTelefono: e.destinatariotelefono || '',
  peso: e.peso != null ? Number(e.peso) : 0,
  descripcion: e.descripcion || '',
  valorDeclarado: e.valordeclarado != null ? Number(e.valordeclarado) : 0,
  oficinaOrigenId: e.idoficinaorigen ? String(e.idoficinaorigen) : '',
  oficinaDestinoId: e.idoficinadestino ? String(e.idoficinadestino) : '',
  oficinaOrigenNombre: e.nombreoficinaorigen || '',
  oficinaDestinoNombre: e.nombreoficinadestino || '',
  estado: (e.estado || 'RECIBIDA') as EstadoEncomienda,
  fechaEnvio: e.fechaenvio || null,
  fechaEntregaEstimada: e.fechaentregaestimada || null,
});

export const useEncomiendas = () => {
  const queryClient = useQueryClient();

  const { data: encomiendas, isLoading, error } = useQuery({
    queryKey: ['encomiendas'],
    queryFn: async () => {
      const response = await encomiendasApi.obtenerTodas();
      const data = response.data.data;
      const encomiendasArray = data.encomiendas || data || [];
      return encomiendasArray.map(mapearEncomienda);
    },
  });

  const create = useMutation({
    mutationFn: async (data: any) => {
      const origenInt = parseInt(data.oficinaOrigenId, 10);
      const destinoInt = parseInt(data.oficinaDestinoId, 10);

      if (isNaN(origenInt) || isNaN(destinoInt)) {
        throw new Error('Debe seleccionar oficina de origen y destino válidas');
      }

      const backendData = {
        remitentenombre: data.remitenteNombre,
        remitentedocumento: data.remitenteDocumento,
        remitentetelefono: data.remitenteTelefono || null,
        destinatarionombre: data.destinatarioNombre,
        destinatariodocumento: data.destinatarioDocumento,
        destinatariotelefono: data.destinatarioTelefono || null,
        peso: parseFloat(data.peso) || 0,
        descripcion: data.descripcion || null,
        valordeclarado: parseFloat(data.valorDeclarado) || 0,
        idoficinaorigen: origenInt,
        idoficinadestino: destinoInt,
      };

      const response = await encomiendasApi.crear(backendData);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['encomiendas'] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const backendData: any = {};
      if (data.remitenteNombre !== undefined) backendData.remitentenombre = data.remitenteNombre;
      if (data.remitenteDocumento !== undefined) backendData.remitentedocumento = data.remitenteDocumento;
      if (data.remitenteTelefono !== undefined) backendData.remitentetelefono = data.remitenteTelefono || null;
      if (data.destinatarioNombre !== undefined) backendData.destinatarionombre = data.destinatarioNombre;
      if (data.destinatarioDocumento !== undefined) backendData.destinatariodocumento = data.destinatarioDocumento;
      if (data.destinatarioTelefono !== undefined) backendData.destinatariotelefono = data.destinatarioTelefono || null;
      if (data.peso !== undefined) backendData.peso = parseFloat(data.peso) || 0;
      if (data.descripcion !== undefined) backendData.descripcion = data.descripcion || null;
      if (data.valorDeclarado !== undefined) backendData.valordeclarado = parseFloat(data.valorDeclarado) || 0;
      if (data.oficinaOrigenId) backendData.idoficinaorigen = parseInt(data.oficinaOrigenId, 10);
      if (data.oficinaDestinoId) backendData.idoficinadestino = parseInt(data.oficinaDestinoId, 10);

      const response = await encomiendasApi.actualizar(id, backendData);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['encomiendas'] }),
  });

  const cambiarEstado = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: EstadoEncomienda }) => {
      const response = await encomiendasApi.actualizarEstado(id, estado);
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
    encomiendas,
    isLoading,
    error,
    create,
    update,
    cambiarEstado,
    eliminar,
  };
};

/**
 * Busca una encomienda por su código de referencia (generado por la plataforma
 * e-commerce al momento de la compra, ya sea como texto o codificado en un QR).
 */
export const buscarEncomiendaPorReferencia = async (referencia: string) => {
  const response = await encomiendasApi.buscarPorReferencia(referencia.trim());
  const data = response.data.data;
  const encomienda = data?.encomienda || data;
  if (!encomienda) return null;
  return mapearEncomienda(encomienda);
};
