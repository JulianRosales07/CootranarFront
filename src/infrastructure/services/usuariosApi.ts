import { httpClient } from '../api/httpClient';

export interface UsuarioDTO {
  idusuario: number;
  idrol: number;
  nombre: string;
  apellido: string;
  correo: string;
  tipodocumento?: string;
  documento?: string;
  telefono?: string;
  activo: boolean;
  fotoperfil?: string;
  nombrerol: string;
  estadocliente?: string;
  proveedor?: string;
  tiene_ecommerce?: boolean;
}

export interface RolDTO {
  idrol: number;
  nombre: string;
  activo: boolean;
}

export interface VehiculoPropietarioDTO {
  idvehiculo: number;
  placa: string;
  numeromovil: string;
  tipovehiculo?: string;
  activo: boolean;
  tipobus_nombre?: string;
  tiposervicio_nombre?: string;
}

export const usuariosApi = {
  obtenerTodos: (params: Record<string, unknown> = {}) =>
    httpClient.get('/usuarios', { params }),

  obtenerRoles: () =>
    httpClient.get('/usuarios/roles'),

  crear: (data: Record<string, unknown>) =>
    httpClient.post('/usuarios', data),

  actualizar: (idusuario: number, data: Record<string, unknown>) =>
    httpClient.put(`/usuarios/${idusuario}`, data),

  cambiarRol: (idusuario: number, idrol: number) =>
    httpClient.put(`/usuarios/${idusuario}/rol`, { idrol }),

  cambiarEstado: (idusuario: number, activo: boolean) =>
    httpClient.patch(`/usuarios/${idusuario}/estado`, { activo }),

  configurarAccesoEcommerce: (idusuario: number, data: { password?: string; habilitar?: boolean }) =>
    httpClient.post(`/usuarios/${idusuario}/acceso-ecommerce`, data),

  obtenerVehiculosPropietario: (idusuario: number) =>
    httpClient.get(`/usuarios/${idusuario}/vehiculos`),
};
