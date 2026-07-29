import { useQuery } from '@tanstack/react-query';
import { reportesApi } from '../../infrastructure/services/reportesApi';
import type {
  FiltrosReporte, TotalesReporte, IngresoVehiculo, IngresoDiario,
  IngresoOficina, DetalleTiquete, PaginacionReporte,
} from '../../application/dto/ReporteDTO';

/** Convierte los filtros del frontend a query params, omitiendo los vacíos. */
const construirParams = (filtros: FiltrosReporte): Record<string, unknown> => {
  const params: Record<string, unknown> = {};
  if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
  if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
  if (filtros.idVehiculo) params.idVehiculo = filtros.idVehiculo;
  if (filtros.idOficina) params.idOficina = filtros.idOficina;
  if (filtros.idAgencia) params.idAgencia = filtros.idAgencia;
  if (filtros.origen) params.origen = filtros.origen;
  if (filtros.incluirPendientes) params.incluirPendientes = true;
  if (filtros.page) params.page = filtros.page;
  if (filtros.limit) params.limit = filtros.limit;
  return params;
};

interface ResumenDashboard {
  totales: TotalesReporte;
  ingresosDiarios: IngresoDiario[];
  ingresosPorOficina: IngresoOficina[];
}

/**
 * Resumen consolidado del dashboard: KPIs, serie diaria y ventas por oficina.
 */
export const useResumenDashboard = (filtros: FiltrosReporte = {}) => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['reportes', 'dashboard', filtros],
    queryFn: async () => {
      const response = await reportesApi.resumenDashboard(construirParams(filtros));
      return response.data.data as ResumenDashboard;
    },
  });

  return {
    totales: data?.totales ?? null,
    ingresosDiarios: data?.ingresosDiarios ?? [],
    ingresosPorOficina: data?.ingresosPorOficina ?? [],
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

interface ReporteIngresosVehiculo {
  vehiculos: IngresoVehiculo[];
  totales: TotalesReporte;
  paginacion: PaginacionReporte;
}

/**
 * Reporte contable de ingresos por venta de tiquetes agrupado por bus.
 */
export const useIngresosPorVehiculo = (filtros: FiltrosReporte = {}) => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['reportes', 'ingresos-vehiculo', filtros],
    queryFn: async () => {
      const response = await reportesApi.ingresosPorVehiculo(construirParams(filtros));
      return response.data.data as ReporteIngresosVehiculo;
    },
  });

  return {
    vehiculos: data?.vehiculos ?? [],
    totales: data?.totales ?? null,
    paginacion: data?.paginacion ?? null,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

interface DetalleTiquetesVehiculo {
  tiquetes: DetalleTiquete[];
  paginacion: PaginacionReporte;
}

/**
 * Detalle de tiquetes vendidos de un bus específico (auditoría contable).
 * Solo consulta cuando hay un idVehiculo seleccionado.
 */
export const useDetalleTiquetesVehiculo = (idVehiculo: string | null, filtros: FiltrosReporte = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['reportes', 'detalle-tiquetes', idVehiculo, filtros],
    enabled: !!idVehiculo,
    queryFn: async () => {
      const response = await reportesApi.detalleTiquetesPorVehiculo(idVehiculo!, construirParams(filtros));
      return response.data.data as DetalleTiquetesVehiculo;
    },
  });

  return {
    tiquetes: data?.tiquetes ?? [],
    paginacion: data?.paginacion ?? null,
    isLoading,
    error,
  };
};

/** El backend limita cada página del detalle a 200 registros. */
const LIMITE_POR_PAGINA_DETALLE = 200;
/** Tope de seguridad para no entrar en un bucle infinito de paginación. */
const MAX_PAGINAS_EXPORT = 100;

/**
 * Trae el detalle completo de tiquetes de un bus por demanda (sin hook), para
 * generar la exportación a Excel al hacer clic.
 *
 * Recorre todas las páginas porque el backend tope cada respuesta en 200
 * registros y el archivo contable debe incluir todos los tiquetes del periodo.
 */
export const obtenerDetalleTiquetesParaExport = async (
  idVehiculo: string,
  filtros: FiltrosReporte = {}
): Promise<DetalleTiquete[]> => {
  const acumulados: DetalleTiquete[] = [];
  let page = 1;
  let totalPaginas = 1;

  do {
    const params = construirParams({ ...filtros, page, limit: LIMITE_POR_PAGINA_DETALLE });
    const response = await reportesApi.detalleTiquetesPorVehiculo(idVehiculo, params);
    const data = response.data.data as DetalleTiquetesVehiculo;

    acumulados.push(...(data.tiquetes ?? []));
    totalPaginas = data.paginacion?.totalPaginas ?? 1;
    page++;
  } while (page <= totalPaginas && page <= MAX_PAGINAS_EXPORT);

  return acumulados;
};
