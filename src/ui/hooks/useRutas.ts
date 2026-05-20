import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rutasApi } from '../../infrastructure/services/rutasApi';

export const useRutas = () => {
  const queryClient = useQueryClient();

  const { data: rutas, isLoading, error } = useQuery({
    queryKey: ['rutas'],
    queryFn: async () => {
      const response = await rutasApi.obtenerTodas({ limit: 100, page: 1 });
      console.log('Response rutas:', response.data);
      const data = response.data.data;
      const rutasArray = data.rutas || data || [];
      
      // Debug: ver una ruta completa
      if (rutasArray.length > 0) {
        console.log('Primera ruta raw:', rutasArray[0]);
      }

      // Mapear campos del backend al frontend
      const rutasMapeadas = rutasArray.map((ruta: any) => ({
        id: ruta.idruta,
        nombre: ruta.nombre,
        origen: ruta.idagenciaorigen ? String(ruta.idagenciaorigen) : '',
        destino: ruta.idagenciadestino ? String(ruta.idagenciadestino) : '',
        tiporuta: ruta.tiporuta || 'INTERMUNICIPAL',
        duracionMinutos: ruta.duracionaprox || 0,
        duracionh: ruta.duracionh ?? 0,
        duracionm: ruta.duracionm ?? 0,
        precioBase: ruta.distanciakm || 0,
        distanciakm: ruta.distanciakm || null,
        via: ruta.via || '',
        activa: ruta.activo !== false,
        precioNormal: ruta.valornormal ? Number(ruta.valornormal) : null,
        precioTraficoAlto: ruta.valortraficoalto ? Number(ruta.valortraficoalto) : null,
        adicionalPoltrona: ruta.adicionalpoltrona ? Number(ruta.adicionalpoltrona) : null,
        precioActual: ruta.precioactual ? Number(ruta.precioactual) : null,
        estadoPrecio: ruta.estraficoalto ? 'trafico-alto' : 'normal',
        tipoBus: ruta.nombretipobus || null,
        idTipoBus: ruta.idtipobus || null,
        nombreagenciaorigen: ruta.nombreagenciaorigen || '',
        nombreagenciadestino: ruta.nombreagenciadestino || '',
      }));
      
      // Debug: ver una ruta mapeada
      if (rutasMapeadas.length > 0) {
        console.log('Primera ruta mapeada:', rutasMapeadas[0]);
      }
      
      return rutasMapeadas;
    },
  });

  const create = useMutation({
    mutationFn: async (data: any) => {
      const origenInt = parseInt(data.origen, 10);
      const destinoInt = parseInt(data.destino, 10);

      if (isNaN(origenInt) || isNaN(destinoInt)) {
        throw new Error('Debe seleccionar agencias de origen y destino válidas');
      }

      const backendData: any = {
        nombre: data.nombre,
        tiporuta: data.tiporuta || 'INTERMUNICIPAL',
        idagenciaorigen: origenInt,
        idagenciadestino: destinoInt,
        duracionh: parseInt(data.duracionh) || 0,
        duracionm: parseInt(data.duracionm) || 0,
        duracionaprox: (parseInt(data.duracionh) || 0) * 60 + (parseInt(data.duracionm) || 0),
        distanciakm: parseFloat(data.distanciakm) || null,
        via: data.via || null,
      };

      // Incluir puntos si vienen
      if (data.puntos && Array.isArray(data.puntos)) {
        backendData.puntos = data.puntos;
      }

      const response = await rutasApi.crear(backendData);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rutas'] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const backendData: any = {};
      if (data.nombre) backendData.nombre = data.nombre;
      if (data.tiporuta) backendData.tiporuta = data.tiporuta;
      if (data.origen) backendData.idagenciaorigen = parseInt(data.origen, 10);
      if (data.destino) backendData.idagenciadestino = parseInt(data.destino, 10);
      if (data.duracionh !== undefined) backendData.duracionh = parseInt(data.duracionh) || 0;
      if (data.duracionm !== undefined) backendData.duracionm = parseInt(data.duracionm) || 0;
      if (data.duracionh !== undefined || data.duracionm !== undefined) {
        backendData.duracionaprox = (parseInt(data.duracionh) || 0) * 60 + (parseInt(data.duracionm) || 0);
      }
      if (data.distanciakm !== undefined) backendData.distanciakm = parseFloat(data.distanciakm) || null;
      if (data.via !== undefined) backendData.via = data.via || null;

      // Incluir puntos si vienen
      if (data.puntos && Array.isArray(data.puntos)) {
        backendData.puntos = data.puntos;
      }

      const response = await rutasApi.actualizar(id, backendData);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rutas'] }),
  });

  const toggleEstado = useMutation({
    mutationFn: async ({ id, activa }: { id: string; activa: boolean }) => {
      const response = activa
        ? await rutasApi.desactivar(id)
        : await rutasApi.activar(id);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rutas'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const response = await rutasApi.eliminar(id);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rutas'] }),
  });

  return { rutas, isLoading, error, create, update, remove, toggleEstado };
};

/** Hook auxiliar para obtener los puntos de una ruta específica */
export const usePuntosRuta = (idruta: string | number | null) => {
  return useQuery({
    queryKey: ['rutas', idruta, 'puntos'],
    queryFn: async () => {
      if (!idruta) return [];
      const response = await rutasApi.obtenerPuntos(idruta);
      return response.data?.data?.puntos || response.data?.puntos || [];
    },
    enabled: !!idruta,
  });
};
