export type EstadoPoliza = 'VIGENTE' | 'VENCIDA' | 'CANCELADA';

export interface Poliza {
  id: string;
  numero: string;
  aseguradoraId: string;
  vehiculoId: string;
  fechaInicio: Date;
  fechaVencimiento: Date;
  valorAsegurado: number;
  estado: EstadoPoliza;
  createdAt: Date;
  updatedAt: Date;
}
