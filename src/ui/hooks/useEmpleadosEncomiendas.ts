import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empleadosEncomiendasApi } from '../../infrastructure/services/empleadosEncomiendasApi';

export const useEmpleadosEncomiendas = () => {
  const queryClient = useQueryClient();

  const { data: empleados, isLoading, error } = useQuery({
    queryKey: ['empleados-encomiendas'],
    queryFn: async () => {
      const response = await empleadosEncomiendasApi.obtenerTodos();
      const data = response.data.data;
      const empleadosArray = data.empleadosEncomiendas || data || [];
      
      // Mapear campos del backend al frontend
      return empleadosArray.map((emp: any) => ({
        id: emp.idusuario ? String(emp.idusuario) : String(emp.id || ''),
        idusuario: emp.idusuario,
        nombre: emp.nombre || '',
        apellido: emp.apellido || '',
        correo: emp.correo || '',
        email: emp.correo || '', // Alias
        tipodocumento: emp.tipodocumento || 'CC',
        documento: emp.documento || '',
        telefono: emp.telefono || '',
        idoficinaencomienda: emp.idoficinaencomienda,
        direccionoficina: emp.direccionoficina || '',
        idciudad: emp.idciudad,
        nombreciudad: emp.nombreciudad || '',
        activo: emp.activo !== false
      }));
    },
  });

  const create = useMutation({
    mutationFn: async (data: any) => {
      const response = await empleadosEncomiendasApi.crear(data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['empleados-encomiendas'] }),
  });

  const update = useMutation({
    mutationFn: async ({ idusuario, data }: { idusuario: number; data: any }) => {
      const response = await empleadosEncomiendasApi.actualizar(String(idusuario), data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['empleados-encomiendas'] }),
  });

  const activar = useMutation({
    mutationFn: async (idusuario: number) => {
      const response = await empleadosEncomiendasApi.activar(String(idusuario));
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['empleados-encomiendas'] }),
  });

  return { empleados, isLoading, error, create, update, activar };
};
