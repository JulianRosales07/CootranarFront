import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiEmpleadoEncomiendaRepository } from '../../infrastructure/repositories/ApiEmpleadoEncomiendaRepository';
import { getEmpleadosEncomiendas } from '../../application/use-cases/empleados-encomiendas/getEmpleadosEncomiendas';
import { createEmpleadoEncomienda } from '../../application/use-cases/empleados-encomiendas/createEmpleadoEncomienda';
import { updateEmpleadoEncomienda } from '../../application/use-cases/empleados-encomiendas/updateEmpleadoEncomienda';
import type { EmpleadoEncomienda } from '../../domain/entities/EmpleadoEncomienda';

const repository = new ApiEmpleadoEncomiendaRepository();

export const useEmpleadosEncomiendas = () => {
  const queryClient = useQueryClient();

  const { data: empleados, isLoading, error } = useQuery({
    queryKey: ['empleados-encomiendas'],
    queryFn: () => getEmpleadosEncomiendas(repository),
  });

  const create = useMutation({
    mutationFn: (data: Omit<EmpleadoEncomienda, 'id'>) =>
      createEmpleadoEncomienda(repository, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['empleados-encomiendas'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmpleadoEncomienda> }) =>
      updateEmpleadoEncomienda(repository, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['empleados-encomiendas'] }),
  });

  return { empleados, isLoading, error, create, update };
};
