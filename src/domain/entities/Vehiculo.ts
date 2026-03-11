export type EstadoVehiculo = 'DISPONIBLE' | 'EN_RUTA' | 'MANTENIMIENTO' | 'FUERA_SERVICIO';

export interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  año: number;
  tipoBusId: string;
  capacidad: number;
  estado: EstadoVehiculo;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
