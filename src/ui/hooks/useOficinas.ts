import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { oficinasApi } from '../../infrastructure/services/oficinasApi';
import type { Oficina } from '../../domain/entities/Oficina';

export const useOficinas = () => {
  const queryClient = useQueryClient();

  const { data: oficinas, isLoading, error } = useQuery({
    queryKey: ['oficinas'],
    queryFn: async () => {
      const response = await oficinasApi.obtenerTodas();
      const data = response.data.data;
      return data.oficinas || data || [];
    },
  });

  const create = useMutation({
    mutationFn: async (data: any) => {
      console.log('=== DEBUG CREATE OFICINA ===');
      console.log('1. Datos recibidos del formulario:', data);
      console.log('2. data.nombre:', data.nombre);
      console.log('3. data.agenciaId:', data.agenciaId);
      console.log('4. typeof data.agenciaId:', typeof data.agenciaId);
      
      // Validar que agenciaId no esté vacío
      if (!data.agenciaId || data.agenciaId === '') {
        console.error('ERROR: agenciaId está vacío');
        throw new Error('Debe seleccionar una agencia');
      }
      
      const parsedAgenciaId = parseInt(data.agenciaId, 10);
      console.log('5. parsedAgenciaId:', parsedAgenciaId);
      console.log('6. isNaN(parsedAgenciaId):', isNaN(parsedAgenciaId));
      
      if (isNaN(parsedAgenciaId)) {
        console.error('ERROR: agenciaId no es un número válido');
        throw new Error('ID de agencia inválido');
      }
      
      // Enviar el nombre como código (el campo codigo en BD es el nombre de la oficina)
      const backendData = {
        codigo: data.nombre, // El nombre se guarda en el campo codigo
        idagencia: parsedAgenciaId
      };
      console.log('7. Datos finales enviados al backend:', backendData);
      console.log('8. JSON.stringify(backendData):', JSON.stringify(backendData));
      
      const response = await oficinasApi.crear(backendData);
      console.log('9. Respuesta del backend:', response);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oficinas'] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Para actualizar, enviar nombre como codigo
      const backendData: any = {};
      if (data.nombre) backendData.codigo = data.nombre;
      if (data.agenciaId) backendData.idagencia = parseInt(data.agenciaId, 10);
      
      const response = await oficinasApi.actualizar(id, backendData);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oficinas'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const response = await oficinasApi.eliminar(id);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oficinas'] }),
  });

  return {
    oficinas,
    isLoading,
    error,
    create,
    update,
    remove,
  };
};
