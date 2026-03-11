import type { EstadoEncomienda } from '@/domain/entities/Encomienda';

export interface EncomiendaDTO {
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
  fechaEnvio: string;
  fechaEntregaEstimada: string;
}

export interface CreateEncomiendaDTO {
  remitenteNombre: string;
  remitenteDocumento: string;
  destinatarioNombre: string;
  destinatarioDocumento: string;
  peso: number;
  descripcion: string;
  origen: string;
  destino: string;
  rutaId: string;
}

export interface UpdateEncomiendaStatusDTO {
  estado: EstadoEncomienda;
}
