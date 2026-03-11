import type { EstadoTiquete } from '@/domain/entities/Tiquete';

export interface TiqueteDTO {
  id: string;
  origen: string;
  destino: string;
  fechaViaje: string;
  pasajeroNombre: string;
  pasajeroDocumento: string;
  precio: number;
  estado: EstadoTiquete;
  asiento: string;
  rutaId: string;
}

export interface CreateTiqueteDTO {
  origen: string;
  destino: string;
  fechaViaje: string;
  pasajeroNombre: string;
  pasajeroDocumento: string;
  precio: number;
  asiento: string;
  rutaId: string;
}

export interface UpdateTiqueteDTO {
  estado?: EstadoTiquete;
  asiento?: string;
}
