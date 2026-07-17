export type EstadoDespacho = 'PROGRAMADO' | 'EN_RUTA' | 'LLEGADO';

export interface DespachoDTO {
  id: string;
  codigoDespacho: string;
  idOficinaOrigen: string;
  idOficinaDestino: string;
  oficinaOrigenNombre: string;
  oficinaDestinoNombre: string;
  idVehiculo: string;
  idConductor: string;
  placa: string;
  nombreConductor: string;
  estado: EstadoDespacho;
  fechaProgramada: string | null;
  fechaSalida: string | null;
  fechaLlegada: string | null;
  totalEncomiendas: number;
}

export interface CrearDespachoDTO {
  idOficinaDestino: string;
  idVehiculo: string;
  idConductor: string;
  idsEncomienda: string[];
  fechaProgramada?: string;
}
