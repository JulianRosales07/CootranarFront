import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiTarifaEncomiendaRepository } from '../../infrastructure/repositories/ApiTarifaEncomiendaRepository';
import { getTarifasEncomiendas } from '../../application/use-cases/tarifas-encomiendas/getTarifasEncomiendas';
import { createTarifaEncomienda } from '../../application/use-cases/tarifas-encomiendas/createTarifaEncomienda';
import { updateTarifaEncomienda } from '../../application/use-cases/tarifas-encomiendas/updateTarifaEncomienda';
import type { TarifaEncomienda } from '../../domain/entities/TarifaEncomienda';

const repository = new ApiTarifaEncomiendaRepository();

export const useTarifasEncomiendas = (filtros: Record<string, any> = {}) => {
  const queryClient = useQueryClient();

  const queryKey = ['tarifas-encomiendas', filtros];

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      // Listamos con límite amplio (100) para tener la matriz de tarifas completa en frontend
      const resultado = await getTarifasEncomiendas(repository, { limit: 200, ...filtros });
      return resultado;
    },
  });

  const tarifas: TarifaEncomienda[] = data?.tarifas ?? [];
  const paginacion = data?.paginacion;

  const createMutation = useMutation({
    mutationFn: async (datos: { idOficinaOrigen: number; idOficinaDestino: number; valorBase: number }) => {
      return await createTarifaEncomienda(repository, datos);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarifas-encomiendas'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      datos,
    }: {
      id: number;
      datos: { valorBase: number; idOficinaOrigen?: number; idOficinaDestino?: number };
    }) => {
      return await updateTarifaEncomienda(repository, id, datos);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarifas-encomiendas'] });
    },
  });

  return {
    tarifas,
    paginacion,
    isLoading,
    error,
    refetch,
    createTarifa: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    updateTarifa: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
};
