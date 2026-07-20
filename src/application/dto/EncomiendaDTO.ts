export type EstadoEncomienda =
  | 'COTIZADA'
  | 'REGISTRADA'
  | 'EN_TRANSITO'
  | 'EN_DESTINO'
  | 'ENTREGADA'
  | 'DEVUELTA';

export interface EncomiendaDTO {
  id: string;
  referencia: string;
  idOficinaOrigen: string;
  idOficinaDestino: string;
  oficinaOrigenNombre: string;
  oficinaDestinoNombre: string;
  nombreRemitente: string;
  documentoRemitente: string;
  telefonoRemitente: string;
  nombreEmpleado: string;
  nombreDestinatario: string;
  documentoDestinatario: string;
  telefonoDestinatario: string;
  direccionDestinatario: string;
  contenidoDeclarado: string;
  pesoEstimado: number | null;
  volumenEstimado: number | null;
  pesoReal: number | null;
  volumenReal: number | null;
  valorDeclarado: number;
  valorCobrado: number | null;
  esDomicilio: boolean;
  valorDomicilio: number;
  estado: EstadoEncomienda;
  fechaRegistro: string | null;
  fechaDespacho: string | null;
  fechaRecepcionDestino: string | null;
  fechaEntrega: string | null;
}

export interface CotizacionEncomiendaDTO {
  idOficinaOrigen: string;
  idOficinaDestino: string;
  pesoEstimado: string;
  volumenEstimado: string;
  valorDeclarado: string;
  esDomicilio: boolean;
  valorDomicilio: string;
}

export interface PreinscripcionEncomiendaDTO {
  idOficinaOrigen: string;
  idOficinaDestino: string;
  nombreDestinatario: string;
  documentoDestinatario: string;
  telefonoDestinatario: string;
  direccionDestinatario?: string;
  contenidoDeclarado: string;
  pesoEstimado: string;
  volumenEstimado?: string;
  valorDeclarado?: string;
  esDomicilio?: boolean;
  valorDomicilio?: string;
}

export interface RegistrarEncomiendaConPreinscripcionDTO {
  referenciaEncomienda: string;
  nombreDestinatario?: string;
  documentoDestinatario?: string;
  telefonoDestinatario?: string;
  direccionDestinatario?: string;
  contenidoDeclarado?: string;
  valorDeclarado?: string;
  pesoReal: string;
  volumenReal: string;
  idMetodoPago: string;
  formaPago: 'CONTADO' | 'CREDITO';
  numeroCuotas?: string;
  esDomicilio?: boolean;
  valorDomicilio?: string;
}

export interface RegistrarEncomiendaDirectaDTO {
  nombreRemitente: string;
  documentoRemitente: string;
  telefonoRemitente: string;
  nombreDestinatario: string;
  documentoDestinatario: string;
  telefonoDestinatario: string;
  direccionDestinatario?: string;
  contenidoDeclarado: string;
  idOficinaDestino: string;
  pesoReal: string;
  volumenReal: string;
  valorDeclarado: string;
  idMetodoPago: string;
  formaPago: 'CONTADO' | 'CREDITO';
  numeroCuotas?: string;
  esDomicilio?: boolean;
  valorDomicilio?: string;
}

export interface CambiarEstadoEncomiendaDTO {
  accion: 'CONFIRMAR_RECEPCION' | 'ENTREGAR' | 'DEVOLVER';
  documentoRecibe?: string;
  nombreRecibe?: string;
  observaciones?: string;
}
