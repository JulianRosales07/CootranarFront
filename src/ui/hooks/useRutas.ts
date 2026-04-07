import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rutasApi } from '../../infrastructure/services/rutasApi';

export const useRutas = () => {
  const queryClient = useQueryClient();

  const { data: rutas, isLoading, error } = useQuery({
    queryKey: ['rutas'],
    queryFn: async () => {
      const response = await rutasApi.obtenerTodas({ limit: 1000, page: 1 });
      console.log('Response rutas:', response.data);
      const data = response.data.data;
      const rutasArray = data.rutas || data || [];
      
      // Mapear campos del backend al frontend
      return rutasArray.map((ruta: any) => ({
        id: ruta.idruta,
        nombre: ruta.nombre,
        origen: ruta.idagenciaorigen ? String(ruta.idagenciaorigen) : '',
        destino: ruta.idagenciadestino ? String(ruta.idagenciadestino) : '',
        duracionMinutos: ruta.duracionaprox || 0,
        precioBase: ruta.distanciakm || 0,
        activa: ruta.activa !== false,
        precioNormal: ruta.precionormal ? Number(ruta.precionormal) : null,
        precioTraficoAlto: ruta.preciotraficoalto ? Number(ruta.preciotraficoalto) : null,
        tipoBus: ruta.nombretipobus || null,
        idTipoBus: ruta.idtipobus || null
      }));
    },
  });

  const create = useMutation({
    mutationFn: async (data: any) => {
      // Mapear campos del frontend al backend
      const origenInt = parseInt(data.origen, 10);
      const destinoInt = parseInt(data.destino, 10);
      
      if (isNaN(origenInt) || isNaN(destinoInt)) {
        throw new Error('Debe seleccionar agencias de origen y destino válidas');
      }
      
      const backendData = {
        nombre: data.nombre,
        idagenciaorigen: origenInt,
        idagenciadestino: destinoInt,
        duracionaprox: data.duracionMinutos || 0,
        distanciakm: data.precioBase || 0
      };
      
      const response = await rutasApi.crear(backendData);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rutas'] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Mapear campos del frontend al backend
      const backendData: any = {};
      if (data.nombre) backendData.nombre = data.nombre;
      if (data.origen) backendData.idagenciaorigen = parseInt(data.origen, 10);
      if (data.destino) backendData.idagenciadestino = parseInt(data.destino, 10);
      if (data.duracionMinutos !== undefined) backendData.duracionaprox = data.duracionMinutos;
      if (data.precioBase !== undefined) backendData.distanciakm = data.precioBase;
      
      const response = await rutasApi.actualizar(id, backendData);
      return response.data.data;
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

  return { rutas, isLoading, error, create, update, remove };
};
