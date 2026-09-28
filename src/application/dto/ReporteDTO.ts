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

export interface EcommerceKPIs {
  tiquetes_vendidos: number;
  total_ingresos: number;
  promedio_tiquete: number;
  clientes_compradores: number;
  viajes_con_ventas: number;
}

export interface EcommerceFunnel {
  total_intentos: number;
  aprobados: number;
  pendientes: number;
  rechazados: number;
  monto_aprobado: number;
  monto_total_intentado: number;
  tasaConversion: number;
  tasaAbandono: number;
}

export interface CanalComparativa {
  canal: 'E-commerce' | 'Taquilla';
  tiquetes: number;
  ingresos: number;
  promediotiquete: number;
}

export interface EcommerceComparativaCanales {
  detalles: CanalComparativa[];
  totalTiquetesGeneral: number;
  totalIngresosGeneral: number;
  penetracionVolumen: number;
  penetracionIngresos: number;
}

export interface EcommerceTopRuta {
  origen: string;
  destino: string;
  tiquetes: number;
  totalingresos: number;
  promediotiquete: number;
}

export interface EcommerceHoraInteraccion {
  hora: number;
  total_interacciones: number;
  compras_exitosas: number;
}

export interface EcommerceTransaccionDetalle {
  idpagowompi: number;
  referencia: string;
  monto: number;
  estado: string;
  fechacreacion: string;
  nombrecliente: string;
  correocliente: string | null;
  idviaje: number;
  fechasalida: string | null;
  horasalida: string | null;
  nombreruta: string | null;
  cantidadasientos: number;
  pasajeros: string;
  origennombre: string;
  destinonombre: string;
}

export interface EcommerceFidelizacion {
  total_clientes_registrados: number;
  total_canjes: number;
  total_millas_redimidas: number;
}

export interface EcommerceEvaluacion {
  estado: 'POSITIVO' | 'ATENCION' | 'INICIAL';
  badge: string;
  color: string;
  mensaje: string;
}

export interface EcommerceAnalyticsResponse {
  kpis: EcommerceKPIs;
  funnel: EcommerceFunnel;
  comparativaCanales: EcommerceComparativaCanales;
  topRutas: EcommerceTopRuta[];
  horasInteraccion: EcommerceHoraInteraccion[];
  serieDiaria: IngresoDiario[];
  transacciones: EcommerceTransaccionDetalle[];
  fidelizacion: EcommerceFidelizacion;
  evaluacion: EcommerceEvaluacion;
  filtrosAplicados: {
    fechaDesde: string | null;
    fechaHasta: string | null;
  };
}

