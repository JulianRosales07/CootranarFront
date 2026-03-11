export type EstadoEncomienda = 'RECIBIDA' | 'EN_TRANSITO' | 'ENTREGADA' | 'DEVUELTA';

export interface Encomienda {
  id: string;
  remitenteNombre: string;
  remitenteDocumento: string;
  destinatarioNombre: string;
  destinatarioDocumento: string;
  peso: number;
  descripcion: string;
  origen: string;
  destino: string;
  precio: number;
  estado: EstadoEncomienda;
  fechaEnvio: Date;
  fechaEntregaEstimada: Date;
  createdAt: Date;
}
