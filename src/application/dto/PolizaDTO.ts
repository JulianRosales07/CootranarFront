import type { EstadoPoliza } from '@/domain/entities/Poliza';

export interface PolizaDTO {
  id: string;
  numero: string;
  aseguradoraId: string;
  vehiculoId: string;
  fechaInicio: string;
  fechaVencimiento: string;
  valorAsegurado: number;
  estado: EstadoPoliza;
}

export interface CreatePolizaDTO {
  numero: string;
  aseguradoraId: string;
  vehiculoId: string;
  fechaInicio: string;
  fechaVencimiento: string;
  valorAsegurado: number;
}

export interface UpdatePolizaDTO {
  numero?: string;
  aseguradoraId?: string;
  vehiculoId?: string;
  fechaInicio?: string;
  fechaVencimiento?: string;
  valorAsegurado?: number;
  estado?: EstadoPoliza;
}
