import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { oficinasEncomiendasApi } from '../../infrastructure/services/oficinasEncomiendasApi';

export const useOficinasEncomiendas = () => {
  const queryClient = useQueryClient();

  const { data: oficinas, isLoading, error } = useQuery({
    queryKey: ['oficinas-encomiendas'],
    queryFn: async () => {
      const response = await oficinasEncomiendasApi.obtenerTodas();
      const data = response.data.data;
      const oficinasArray = data.oficinasEncomiendas || data || [];
      
      // Mapear campos del backend al frontend
      return oficinasArray.map((oficina: any) => ({
        id: oficina.idoficinaencomienda,
        ciudadId: oficina.idciudad ? String(oficina.idciudad) : '',
        direccion: oficina.direccion || '',
        telefono: oficina.telefono || '',
        activo: oficina.activo !== false,
        ciudadNombre: oficina.nombreciudad,
        nombre: oficina.nombre
      }));
    },
  });

  const create = useMutation({
    mutationFn: async (data: any) => {
      console.log('=== DEBUG OFICINA ENCOMIENDA ===');
      console.log('1. data.ciudadId:', data.ciudadId);
      console.log('2. typeof data.ciudadId:', typeof data.ciudadId);
      
      // Mapear campos del frontend al backend
      const ciudadInt = parseInt(data.ciudadId, 10);
      
      console.log('3. ciudadInt:', ciudadInt);
      console.log('4. isNaN(ciudadInt):', isNaN(ciudadInt));
      
      if (isNaN(ciudadInt)) {
        throw new Error('Debe seleccionar una ciudad válida');
      }
      
      const backendData = {
        idciudad: ciudadInt,
        direccion: data.direccion || null,
        telefono: data.telefono || null
      };
      
      console.log('5. backendData:', backendData);
      
      const response = await oficinasEncomiendasApi.crear(backendData);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oficinas-encomiendas'] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Mapear campos del frontend al backend
      const backendData: any = {};
      if (data.ciudadId) backendData.idciudad = parseInt(data.ciudadId, 10);
      if (data.direccion !== undefined) backendData.direccion = data.direccion || null;
      if (data.telefono !== undefined) backendData.telefono = data.telefono || null;
      
      const response = await oficinasEncomiendasApi.actualizar(id, backendData);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oficinas-encomiendas'] }),
  });

  const activar = useMutation({
    mutationFn: async (id: string) => {
      const response = await oficinasEncomiendasApi.activar(id);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oficinas-encomiendas'] }),
  });

  const desactivar = useMutation({
    mutationFn: async (id: string) => {
      const response = await oficinasEncomiendasApi.eliminar(id);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oficinas-encomiendas'] }),
  });

  return {
    oficinas,
    isLoading,
    error,
    create,
    update,
    activar,
    desactivar,
  };
};
