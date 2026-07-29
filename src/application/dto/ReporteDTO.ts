export interface FiltrosReporte {
  fechaDesde?: string;
  fechaHasta?: string;
  idVehiculo?: string;
  idOficina?: string;
  idAgencia?: string;
  origen?: 'Taquilla' | 'E-commerce' | '';
  incluirPendientes?: boolean;
  page?: number;
  limit?: number;
}

export interface TotalesReporte {
  tiquetesvendidos: number;
  totalingresos: number;
  promediotiquete: number;
  totalvehiculos: number;
  totalviajes: number;
  totaloficinas: number;
}

export interface IngresoVehiculo {
  idvehiculo: number;
  placa: string;
  numeromovil: string;
  capacidad: number | null;
  nombretipobus: string | null;
  nombretiposervicio: string | null;
  nombrepropietario: string | null;
  documentopropietario: string | null;
  tiquetesvendidos: number;
  totalingresos: number;
  promediotiquete: number;
  valorminimo: number;
  valormaximo: number;
  totalviajes: number;
  primeraventa: string | null;
  ultimaventa: string | null;
}

export interface IngresoDiario {
  fecha: string;
  tiquetesvendidos: number;
  totalingresos: number;
}

export interface IngresoOficina {
  idoficina: number | null;
  codigooficina: string | null;
  idagencia: number | null;
  nombreagencia: string | null;
  nombreciudad: string | null;
  tiquetesvendidos: number;
  totalingresos: number;
}

export interface DetalleTiquete {
  idtiquete: number;
  codigotiquete: string | null;
  valorcobrado: number;
  cufe: string | null;
  estadofactura: string;
  origen: string | null;
  fechaexpedicion: string;
  idviaje: number;
  codigoviaje: string | null;
  fechasalida: string;
  horasalida: string;
  nombreruta: string | null;
  numeroasiento: number | null;
  origennombre: string | null;
  destinonombre: string | null;
  nombrepasajero: string | null;
  documentopasajero: string | null;
  nombretaquillero: string;
  codigooficina: string | null;
  nombreagencia: string | null;
  nombremetodopago: string | null;
  formapago: string | null;
}

export interface PaginacionReporte {
  total: number;
  totalPaginas: number;
  paginaActual: number;
  porPagina: number;
}
