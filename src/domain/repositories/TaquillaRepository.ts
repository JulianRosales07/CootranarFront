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

/**
 * Reprogramación: el tiquete se mueve a otro viaje / asiento / tramo.
 * Nunca se devuelve dinero. idPuntoOrigen / idPuntoDestino solo son obligatorios
 * cuando el viaje destino pertenece a otra ruta. idMetodoPago / formaPago solo
 * se envían cuando el tramo nuevo cuesta más que lo ya pagado.
 */
export interface ReprogramarTiqueteData {
  idViajeNuevo: number;
  idAsientoViajeNuevo: number;
  motivo: string;
  idPuntoOrigen?: number;
  idPuntoDestino?: number;
  idMetodoPago?: number;
  formaPago?: 'CONTADO' | 'CREDITO';
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
  reprogramarTiquete(idTiquete: number, data: ReprogramarTiqueteData): Promise<any>;
  obtenerReprogramacionesTiquete(idTiquete: number): Promise<any>;
}
