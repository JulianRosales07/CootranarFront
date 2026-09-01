import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '../../infrastructure/services/usuariosApi';
import type { UsuarioDTO, RolDTO } from '../../infrastructure/services/usuariosApi';

export interface UseUsuariosParams {
  page?: number;
  limit?: number;
  rol?: string;
  estado?: string;
  busqueda?: string;
}

export const useUsuarios = (params: UseUsuariosParams = {}) => {
  const queryClient = useQueryClient();

  const {
    data: usuariosResponse,
    isLoading: isLoadingUsuarios,
    isFetching,
    error: errorUsuarios,
    refetch,
  } = useQuery({
    queryKey: ['usuarios', params],
    queryFn: async () => {
      const res: any = await usuariosApi.obtenerTodos(params as Record<string, unknown>);
      return res?.data?.data || res?.data || res;
    },
  });

  const {
    data: roles,
    isLoading: isLoadingRoles,
  } = useQuery<RolDTO[]>({
    queryKey: ['usuarios-roles'],
    queryFn: async () => {
      const res: any = await usuariosApi.obtenerRoles();
      const rawRoles = res?.data?.data || res?.data || res;
      return (Array.isArray(rawRoles) ? rawRoles : rawRoles?.roles || []) as RolDTO[];
    },
  });

  const create = useMutation({
    mutationFn: (data: Record<string, unknown>) => usuariosApi.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const update = useMutation({
    mutationFn: ({ idusuario, data }: { idusuario: number; data: Record<string, unknown> }) =>
      usuariosApi.actualizar(idusuario, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const cambiarRol = useMutation({
    mutationFn: ({ idusuario, idrol }: { idusuario: number; idrol: number }) =>
      usuariosApi.cambiarRol(idusuario, idrol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const cambiarEstado = useMutation({
    mutationFn: ({ idusuario, activo }: { idusuario: number; activo: boolean }) =>
      usuariosApi.cambiarEstado(idusuario, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const configurarAccesoEcommerce = useMutation({
    mutationFn: ({
      idusuario,
      password,
      habilitar,
    }: {
      idusuario: number;
      password?: string;
      habilitar?: boolean;
    }) => usuariosApi.configurarAccesoEcommerce(idusuario, { password, habilitar }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const rawUsuarios = usuariosResponse?.usuarios || (Array.isArray(usuariosResponse) ? usuariosResponse : []);
  const usuarios: UsuarioDTO[] = Array.isArray(rawUsuarios) ? rawUsuarios : [];
  const rawPaginacion = usuariosResponse?.paginacion;
  const paginacion = {
    totalRegistros: rawPaginacion?.total ?? rawPaginacion?.totalRegistros ?? (Array.isArray(usuarios) ? usuarios.length : 0),
    totalPaginas: rawPaginacion?.totalPaginas ?? 1,
    paginaActual: rawPaginacion?.paginaActual ?? params.page ?? 1,
    limite: rawPaginacion?.porPagina ?? rawPaginacion?.limite ?? params.limit ?? 10,
  };

  const rolesList: RolDTO[] = Array.isArray(roles) ? roles : [];

  return {
    usuarios,
    roles: rolesList,
    paginacion,
    isLoading: isLoadingUsuarios || isLoadingRoles,
    isFetching,
    error: errorUsuarios,
    refetch,
    create,
    update,
    cambiarRol,
    cambiarEstado,
    configurarAccesoEcommerce,
  };
};
