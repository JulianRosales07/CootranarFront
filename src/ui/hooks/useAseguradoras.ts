import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aseguradorasApi } from '../../infrastructure/services/aseguradorasApi';
import type { Aseguradora } from '../../domain/entities/Aseguradora';

export const useAseguradoras = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['aseguradoras'],
    queryFn: async () => {
      const response = await aseguradorasApi.obtenerTodas();
      const data = response.data.data;
      const raw = data.aseguradoras || data || [];
      return Array.isArray(raw) ? raw.map((a: any) => ({
        ...a,
        id: String(a.idaseguradora || a.id),
      })) : [];
    },
  });

  const create = useMutation({
    mutationFn: async (data: Omit<Aseguradora, 'id' | 'activo'>) => {
      const response = await aseguradorasApi.crear(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aseguradoras'] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Aseguradora> }) => {
      const response = await aseguradorasApi.actualizar(id, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aseguradoras'] });
    },
  });

  const deactivate = useMutation({
    mutationFn: async (id: string) => {
      const response = await aseguradorasApi.eliminar(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aseguradoras'] });
    },
  });

  return {
    aseguradoras: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    create,
    update,
    deactivate,
  };
};
