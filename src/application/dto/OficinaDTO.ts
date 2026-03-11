export interface OficinaDTO {
  id: string;
  nombre: string;
  codigo: string;
  direccion: string;
  telefono: string;
  email: string;
  agenciaId: string;
  activo: boolean;
}

export interface CreateOficinaDTO {
  nombre: string;
  codigo: string;
  direccion: string;
  telefono: string;
  email: string;
  agenciaId: string;
}

export interface UpdateOficinaDTO {
  nombre?: string;
  codigo?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  agenciaId?: string;
  activo?: boolean;
}
