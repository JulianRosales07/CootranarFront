import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ciudadesApi } from '../../infrastructure/services/ciudadesApi';

export const useCiudades = () => {
  const queryClient = useQueryClient();

  const { data: ciudades, isLoading, error } = useQuery({
    queryKey: ['ciudades'],
    queryFn: async () => {
      const response = await ciudadesApi.obtenerTodas({ limit: 500, page: 1 });
      const data = response.data.data;
      const ciudadesArray = data.ciudades || data || [];
      
      // Mapear campos del backend al frontend
      return ciudadesArray.map((ciudad: any) => ({
        id: ciudad.idciudad,
        nombre: ciudad.nombre,
        codigo: ciudad.codigopostal,
        codigoDane: ciudad.codigodane || null,
        urlImagenCiudad: ciudad.urlimagenCiudad || null,
        departamentoId: ciudad.iddepartamento ? String(ciudad.iddepartamento) : '',
        departamentoNombre: ciudad.nombredepartamento,
        activo: ciudad.activo !== false
      }));
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mapear campos del frontend al backend
      const backendData = {
        nombre: data.nombre,
        codigopostal: data.codigo || null,
        codigodane: data.codigoDane || null,
        iddepartamento: data.departamentoId ? parseInt(data.departamentoId, 10) : null
      };
      const response = await ciudadesApi.crear(backendData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciudades'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Mapear campos del frontend al backend
      const backendData: any = {};
      if (data.nombre) backendData.nombre = data.nombre;
      if (data.codigo !== undefined) backendData.codigopostal = data.codigo || null;
      if (data.codigoDane !== undefined) backendData.codigodane = data.codigoDane || null;
      if (data.departamentoId) backendData.iddepartamento = parseInt(data.departamentoId, 10);
      if (data.activo !== undefined) backendData.activo = data.activo;
      
      const response = await ciudadesApi.actualizar(id, backendData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciudades'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await ciudadesApi.desactivar(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciudades'] });
    },
  });

  const subirImagenMutation = useMutation({
    mutationFn: async ({ id, archivo }: { id: string; archivo: File }) => {
      const response = await ciudadesApi.subirImagen(id, archivo);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciudades'] });
    },
  });

  return {
    ciudades,
    isLoading,
    error,
    createCiudad: createMutation.mutate,
    updateCiudad: updateMutation.mutate,
    deleteCiudad: deleteMutation.mutate,
    subirImagen: subirImagenMutation.mutate,
  };
};
