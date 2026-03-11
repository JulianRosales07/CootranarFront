export interface AseguradoraDTO {
  id: string;
  nombre: string;
  nit: string;
  telefono: string;
  email: string;
  direccion: string;
  activo: boolean;
}

export interface CreateAseguradoraDTO {
  nombre: string;
  nit: string;
  telefono: string;
  email: string;
  direccion: string;
}

export interface UpdateAseguradoraDTO {
  nombre?: string;
  nit?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo?: boolean;
}
