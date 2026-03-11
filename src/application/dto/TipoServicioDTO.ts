export interface TipoServicioDTO {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface CreateTipoServicioDTO {
  nombre: string;
  descripcion: string;
}

export interface UpdateTipoServicioDTO {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}
