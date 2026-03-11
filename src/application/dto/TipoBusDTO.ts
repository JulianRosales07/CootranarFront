export interface TipoBusDTO {
  id: string;
  nombre: string;
  capacidad: number;
  descripcion: string;
  activo: boolean;
}

export interface CreateTipoBusDTO {
  nombre: string;
  capacidad: number;
  descripcion: string;
}

export interface UpdateTipoBusDTO {
  nombre?: string;
  capacidad?: number;
  descripcion?: string;
  activo?: boolean;
}
