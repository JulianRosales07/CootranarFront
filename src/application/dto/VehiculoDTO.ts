import type { EstadoVehiculo } from '@/domain/entities/Vehiculo';

export interface VehiculoDTO {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  año: number;
  tipoBusId: string;
  capacidad: number;
  estado: EstadoVehiculo;
  activo: boolean;
}

export interface CreateVehiculoDTO {
  placa: string;
  marca: string;
  modelo: string;
  año: number;
  tipoBusId: string;
  capacidad: number;
}

export interface UpdateVehiculoDTO {
  placa?: string;
  marca?: string;
  modelo?: string;
  año?: number;
  tipoBusId?: string;
  capacidad?: number;
  estado?: EstadoVehiculo;
  activo?: boolean;
}
