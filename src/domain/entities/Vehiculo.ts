export type EstadoVehiculo = 'DISPONIBLE' | 'EN_RUTA' | 'MANTENIMIENTO' | 'FUERA_SERVICIO';

export interface Vehiculo {
  id: string;
  placa: string;
  numeromovil: string;
  marca: string;
  año: number;
  tipoBusId: string;
  capacidad: number;
  estado: EstadoVehiculo;
  activo: boolean;
  distribucionasientos?: any;
  createdAt: Date;
  updatedAt: Date;
}
