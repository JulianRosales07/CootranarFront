import type { UserRole } from '@/domain/entities/User';

export interface UserDTO {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
}

export interface CreateUserDTO {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
}

export interface UpdateUserDTO {
  nombre?: string;
  email?: string;
  rol?: UserRole;
  activo?: boolean;
}
