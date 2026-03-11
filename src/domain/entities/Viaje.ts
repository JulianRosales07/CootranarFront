export type EstadoViaje = 'PROGRAMADO' | 'EN_CURSO' | 'COMPLETADO' | 'CANCELADO';

export interface Viaje {
  id: string;
  rutaId: string;
  vehiculoId: string;
  conductorId: string;
  fechaSalida: Date;
  fechaLlegadaEstimada: Date;
  fechaLlegadaReal?: Date;
  estado: EstadoViaje;
  asientosDisponibles: number;
  createdAt: Date;
  updatedAt: Date;
}
