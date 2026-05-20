import { useQuery } from '@tanstack/react-query';
import { rutasApi } from '../../infrastructure/services/rutasApi';

export const useBuscarRutas = (busqueda: string, enabled: boolean = true) => {
  const { data: rutas, isLoading, error } = useQuery({
    queryKey: ['rutas-busqueda', busqueda],
    queryFn: async () => {
      if (!busqueda || busqueda.trim().length === 0) return [];
      
      const response = await rutasApi.buscar(busqueda.trim(), { limit: 100, page: 1 });
      const data = response.data.data;
      const rutasArray = data.rutas || data || [];
      
      return rutasArray.map((ruta: any) => ({
        id: ruta.idruta,
        nombre: ruta.nombre,
        origen: ruta.idagenciaorigen ? String(ruta.idagenciaorigen) : '',
        destino: ruta.idagenciadestino ? String(ruta.idagenciadestino) : '',
        tiporuta: ruta.tiporuta || 'INTERMUNICIPAL',
        duracionh: ruta.duracionh ?? 0,
        duracionm: ruta.duracionm ?? 0,
        distanciakm: ruta.distanciakm || null,
        via: ruta.via || '',
        activa: ruta.activo !== false,
        nombreagenciaorigen: ruta.nombreagenciaorigen || '',
        nombreagenciadestino: ruta.nombreagenciadestino || '',
      }));
    },
    enabled: enabled && !!busqueda && busqueda.trim().length > 0,
  });

  return {
    rutas: rutas || [],
    isLoading,
    error,
  };
};
