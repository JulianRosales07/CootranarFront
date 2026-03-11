import type { EstadoViaje } from '@/domain/entities/Viaje';

export interface ViajeDTO {
  id: string;
  rutaId: string;
  vehiculoId: string;
  conductorId: string;
  fechaSalida: string;
  fechaLlegadaEstimada: string;
  fechaLlegadaReal?: string;
  estado: EstadoViaje;
  asientosDisponibles: number;
}

export interface CreateViajeDTO {
  rutaId: string;
  vehiculoId: string;
  conductorId: string;
  fechaSalida: string;
  fechaLlegadaEstimada: string;
  asientosDisponibles: number;
}

export interface UpdateViajeDTO {
  rutaId?: string;
  vehiculoId?: string;
  conductorId?: string;
  fechaSalida?: string;
  fechaLlegadaEstimada?: string;
  fechaLlegadaReal?: string;
  estado?: EstadoViaje;
  asientosDisponibles?: number;
}
