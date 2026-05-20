export interface PuntoRuta {
  idpuntoruta?: number;
  nombre: string;
  idagencia: number | null;
  orden: number;
  tiempodesdeanteriorth: number;
  tiempodesdeanteriorm: number;
}

export interface Ruta {
  id: string;
  nombre?: string;
  origen: string;
  destino: string;
  tiporuta?: 'INTERMUNICIPAL' | 'MUNICIPAL';
  duracionMinutos: number;
  duracionh?: number;
  duracionm?: number;
  precioBase: number;
  distanciakm?: number;
  via?: string;
  activa: boolean;
  // Campos de precio (calculados por backend)
  precioNormal?: number | null;
  precioTraficoAlto?: number | null;
  adicionalPoltrona?: number | null;
  precioActual?: number | null;
  estadoPrecio?: string | null;
  tipoBus?: string | null;
  idTipoBus?: number | null;
  // Campos de agencia (join)
  nombreagenciaorigen?: string;
  nombreagenciadestino?: string;
}
