import type { EstadoConductor } from '@/domain/entities/Conductor';

export interface ConductorDTO {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  licencia: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
  estado: EstadoConductor;
}

export interface CreateConductorDTO {
  nombre: string;
  apellido: string;
  documento: string;
  licencia: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
}

export interface UpdateConductorDTO {
  nombre?: string;
  apellido?: string;
  documento?: string;
  licencia?: string;
  telefono?: string;
  email?: string;
  fechaNacimiento?: string;
  estado?: EstadoConductor;
}
