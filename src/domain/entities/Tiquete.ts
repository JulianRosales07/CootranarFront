export type EstadoTiquete = 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'USADO';

export interface Tiquete {
  id: string;
  origen: string;
  destino: string;
  fechaViaje: Date;
  pasajeroNombre: string;
  pasajeroDocumento: string;
  precio: number;
  estado: EstadoTiquete;
  asiento: string;
  rutaId: string;
  createdAt: Date;
}
