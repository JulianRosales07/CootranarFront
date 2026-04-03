import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiTarifaRutaRepository } from '../../infrastructure/repositories/ApiTarifaRutaRepository';
import { getTarifasByRuta } from '../../application/use-cases/tarifas-ruta/getTarifasRuta';
import { createTarifaRuta } from '../../application/use-cases/tarifas-ruta/createTarifaRuta';
import { updateTarifaRuta } from '../../application/use-cases/tarifas-ruta/updateTarifaRuta';
import { deleteTarifaRuta } from '../../application/use-cases/tarifas-ruta/deleteTarifaRuta';
import type { TarifaRuta } from '../../domain/entities/TarifaRuta';

const repository = new ApiTarifaRutaRepository();

export const useTarifasRuta = (idRuta?: string) => {
  const queryClient = useQueryClient();

  const { data: tarifas, isLoading, error } = useQuery({
    queryKey: ['tarifas-ruta', idRuta],
    queryFn: () => getTarifasByRuta(repository, idRuta!),
    enabled: !!idRuta,
  });

  const create = useMutation({
    mutationFn: (data: Omit<TarifaRuta, 'id'>) => createTarifaRuta(repository, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tarifas-ruta'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TarifaRuta> }) =>
      updateTarifaRuta(repository, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tarifas-ruta'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTarifaRuta(repository, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tarifas-ruta'] }),
  });

  return { tarifas, isLoading, error, create, update, remove };
};
