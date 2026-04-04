import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agenciasApi } from '../../infrastructure/services/agenciasApi';
import type { Agencia } from '../../domain/entities/Agencia';

export const useAgencias = () => {
  const queryClient = useQueryClient();

  const { data: agencias, isLoading, error } = useQuery({
    queryKey: ['agencias'],
    queryFn: async () => {
      const response = await agenciasApi.obtenerTodas();
      console.log('Response agencias:', response.data);
      return response.data.data.agencias || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mapear campos del frontend al backend
      const backendData = {
        nombre: data.nombre,
        idciudad: data.ciudadId ? parseInt(data.ciudadId, 10) : null,
        direccion: data.direccion || null,
        telefono: data.telefono || null
      };
      const response = await agenciasApi.crear(backendData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencias'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Mapear campos del frontend al backend
      const backendData: any = {};
      if (data.nombre) backendData.nombre = data.nombre;
      if (data.ciudadId) backendData.idciudad = parseInt(data.ciudadId, 10);
      if (data.direccion !== undefined) backendData.direccion = data.direccion || null;
      if (data.telefono !== undefined) backendData.telefono = data.telefono || null;
      
      const response = await agenciasApi.actualizar(id, backendData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencias'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await agenciasApi.eliminar(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencias'] });
    },
  });

  return {
    agencias,
    isLoading,
    error,
    createAgencia: createMutation.mutate,
    updateAgencia: updateMutation.mutate,
    deleteAgencia: deleteMutation.mutate,
  };
};
