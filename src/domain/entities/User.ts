export type UserRole = 'ADMINISTRADOR' | 'TAQUILLERO' | 'EMPLEADO_ENCOMIENDAS' | 'OPERADOR';

export interface User {
  idusuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  nombrerol: string;
  activo: boolean;
}
