export interface AgenciaDTO {
  id: string;
  nombre: string;
  codigo: string;
  direccion: string;
  telefono: string;
  ciudadId: string;
  activo: boolean;
}

export interface CreateAgenciaDTO {
  nombre: string;
  codigo: string;
  direccion: string;
  telefono: string;
  ciudadId: string;
}

export interface UpdateAgenciaDTO {
  nombre?: string;
  codigo?: string;
  direccion?: string;
  telefono?: string;
  ciudadId?: string;
  activo?: boolean;
}
