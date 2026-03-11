export interface CiudadDTO {
  id: string;
  nombre: string;
  departamento: string;
  codigo: string;
  activo: boolean;
}

export interface CreateCiudadDTO {
  nombre: string;
  departamento: string;
  codigo: string;
}

export interface UpdateCiudadDTO {
  nombre?: string;
  departamento?: string;
  codigo?: string;
  activo?: boolean;
}
