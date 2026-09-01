export interface BuscarViajesParams {
  ciudadorigen?: string;
  ciudaddestino?: string;
  fecha?: string;
  numerotiquete?: string;
  page?: number;
  limit?: number;
}

export interface PasajeroData {
  tipodocumento: string;
  documento: string;
  nombre: string;
  apellido: string;
  correo?: string;
  telefono?: string;
}

export interface AsientoVenta {
  idAsientoViaje: number;
  idUsuarioPasajero: number;
  idPuntoOrigen: number;
  idPuntoDestino?: number | null;
  valorCobrado: number;
}

export interface ConfirmarVentaData {
  idViaje: number;
  idMetodoPago: number;
  formaPago: 'CONTADO' | 'CREDITO';
  asientos: AsientoVenta[];
}

export interface CancelarOperacionData {
  idviaje: number;
}

export interface TaquillaRepository {
  buscarViajes(params: BuscarViajesParams): Promise<any>;
  obtenerPuntosDestino(idViaje: number, idPuntoOrigen: number, idTipoBus: number, piso: number): Promise<any>;
  obtenerPuntoOrigenTaquillero(idViaje: number): Promise<any>;
  buscarOCrearPasajero(data: PasajeroData): Promise<any>;
  confirmarVenta(data: ConfirmarVentaData): Promise<any>;
  cancelarOperacion(data: CancelarOperacionData): Promise<any>;
  descargarPdfTiquete(idTiquete: number): Promise<any>;
  abrirTaquilla(): Promise<any>;
  obtenerTarifaTramo(idPuntoOrigen: number, idPuntoDestino: number, idTipoBus: number, piso: number): Promise<any>;
  obtenerTiquetesViaje(idViaje: number): Promise<any>;
}
