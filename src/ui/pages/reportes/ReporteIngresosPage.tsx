import { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useIngresosPorVehiculo, obtenerDetalleTiquetesParaExport } from '../../hooks/useReportes';
import { FiltrosReporte } from '../../components/reportes/FiltrosReporte';
import { TarjetasKpi } from '../../components/reportes/TarjetasKpi';
import { TablaIngresosVehiculo } from '../../components/reportes/TablaIngresosVehiculo';
import { DetalleTiquetesVehiculoModal } from '../../components/reportes/DetalleTiquetesVehiculoModal';
import { rangoMesActual, exportarExcel, formatFecha } from '../../../shared/utils/reporteFormat';
import type { ColumnaExport } from '../../../shared/utils/reporteFormat';
import type { FiltrosReporte as Filtros, IngresoVehiculo, DetalleTiquete } from '../../../application/dto/ReporteDTO';

const BLUE = '#0D3B8E';

/** Columnas del consolidado: una fila por bus. */
const COLUMNAS_CONSOLIDADO: ColumnaExport<IngresoVehiculo>[] = [
  { key: 'numeromovil', label: 'Móvil' },
  { key: 'placa', label: 'Placa' },
  { key: 'nombretipobus', label: 'Tipo de Bus' },
  { key: 'nombretiposervicio', label: 'Tipo de Servicio' },
  { key: 'capacidad', label: 'Capacidad', numero: true },
  { key: 'nombrepropietario', label: 'Propietario' },
  { key: 'documentopropietario', label: 'Documento Propietario' },
  { key: 'totalviajes', label: 'Viajes', numero: true },
  { key: 'tiquetesvendidos', label: 'Tiquetes Vendidos', numero: true },
  { key: 'promediotiquete', label: 'Ticket Promedio', moneda: true },
  { key: 'valorminimo', label: 'Valor Mínimo', moneda: true },
  { key: 'valormaximo', label: 'Valor Máximo', moneda: true },
  { key: 'totalingresos', label: 'Total Recaudado', moneda: true },
  { key: 'primeraventa', label: 'Primera Venta' },
  { key: 'ultimaventa', label: 'Última Venta' },
];

/** Columnas del detalle tiquete por tiquete de un bus. */
const COLUMNAS_DETALLE: ColumnaExport<DetalleTiquete>[] = [
  { key: 'codigotiquete', label: 'Código Tiquete' },
  { key: 'fechaexpedicion', label: 'Fecha Expedición' },
  { key: 'nombreruta', label: 'Ruta' },
  { key: 'origennombre', label: 'Origen' },
  { key: 'destinonombre', label: 'Destino' },
  { key: 'fechasalida', label: 'Fecha Salida' },
  { key: 'horasalida', label: 'Hora Salida' },
  { key: 'numeroasiento', label: 'Asiento', numero: true },
  { key: 'nombrepasajero', label: 'Pasajero' },
  { key: 'documentopasajero', label: 'Documento Pasajero' },
  { key: 'nombretaquillero', label: 'Vendido por' },
  { key: 'codigooficina', label: 'Oficina' },
  { key: 'nombreagencia', label: 'Agencia' },
  { key: 'nombremetodopago', label: 'Método de Pago' },
  { key: 'formapago', label: 'Forma de Pago' },
  { key: 'origen', label: 'Canal' },
  { key: 'estadofactura', label: 'Estado Factura' },
  { key: 'cufe', label: 'CUFE' },
  { key: 'valorcobrado', label: 'Valor Cobrado', moneda: true },
];

export const ReporteIngresosPage = () => {
  const [filtros, setFiltros] = useState<Filtros>({ ...rangoMesActual(), page: 1, limit: 20 });
  const [vehiculoDetalle, setVehiculoDetalle] = useState<IngresoVehiculo | null>(null);
  const [descargandoExcelId, setDescargandoExcelId] = useState<number | null>(null);

  const { vehiculos, totales, paginacion, isLoading, isFetching, error } = useIngresosPorVehiculo(filtros);

  const sufijoPeriodo = `${filtros.fechaDesde || 'inicio'}-a-${filtros.fechaHasta || 'hoy'}`;

  /** Excel consolidado de todos los buses del periodo. */
  const handleExportar = () => {
    exportarExcel(
      `ingresos-por-bus-${sufijoPeriodo}`,
      COLUMNAS_CONSOLIDADO,
      vehiculos,
      {
        nombreHoja: 'Ingresos por bus',
        hojasExtra: [{
          nombre: 'Resumen',
          filas: [
            ['Reporte', 'Ingresos por venta de tiquetes por bus'],
            ['Periodo', `${formatFecha(filtros.fechaDesde)} a ${formatFecha(filtros.fechaHasta)}`],
            ['Canal de venta', filtros.origen || 'Todos'],
            ['Incluye sin facturar', filtros.incluirPendientes ? 'Sí' : 'No'],
            [],
            ['Buses con ventas', totales?.totalvehiculos ?? 0],
            ['Viajes', totales?.totalviajes ?? 0],
            ['Tiquetes vendidos', totales?.tiquetesvendidos ?? 0],
            ['Ticket promedio', totales?.promediotiquete ?? 0],
            ['Total recaudado', totales?.totalingresos ?? 0],
            [],
            ['Generado', new Date().toLocaleString('es-CO')],
          ],
        }],
      }
    );
  };

  /** Excel individual de un bus: resumen + detalle tiquete por tiquete. */
  const handleDescargarExcelVehiculo = async (v: IngresoVehiculo) => {
    setDescargandoExcelId(v.idvehiculo);
    try {
      const tiquetes = await obtenerDetalleTiquetesParaExport(String(v.idvehiculo), filtros);

      await exportarExcel(
        `ingresos-movil-${v.numeromovil}-${sufijoPeriodo}`,
        COLUMNAS_DETALLE,
        tiquetes,
        {
          nombreHoja: 'Detalle tiquetes',
          hojasExtra: [{
            nombre: 'Resumen',
            filas: [
              ['Reporte', `Ingresos del móvil ${v.numeromovil}`],
              ['Periodo', `${formatFecha(filtros.fechaDesde)} a ${formatFecha(filtros.fechaHasta)}`],
              ['Canal de venta', filtros.origen || 'Todos'],
              ['Incluye sin facturar', filtros.incluirPendientes ? 'Sí' : 'No'],
              [],
              ['Móvil', v.numeromovil],
              ['Placa', v.placa],
              ['Tipo de bus', v.nombretipobus ?? '—'],
              ['Tipo de servicio', v.nombretiposervicio ?? '—'],
              ['Capacidad', v.capacidad ?? 0],
              ['Propietario', v.nombrepropietario ?? '—'],
              ['Documento propietario', v.documentopropietario ?? '—'],
              [],
              ['Viajes', v.totalviajes],
              ['Tiquetes vendidos', v.tiquetesvendidos],
              ['Ticket promedio', v.promediotiquete],
              ['Valor mínimo', v.valorminimo],
              ['Valor máximo', v.valormaximo],
              ['Total recaudado', v.totalingresos],
              [],
              ['Tiquetes exportados', tiquetes.length],
              ['Generado', new Date().toLocaleString('es-CO')],
            ],
          }],
        }
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'No se pudo generar el Excel de este bus.');
    } finally {
      setDescargandoExcelId(null);
    }
  };

  return (
    <Layout>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Reporte de Ingresos por Bus
        </h2>
        <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0' }}>
          Recaudo por venta de tiquetes discriminado por vehículo, para conciliación contable.
        </p>
      </div>

      <FiltrosReporte
        filtros={filtros}
        onChange={setFiltros}
        cargando={isFetching}
        onExportar={vehiculos.length > 0 ? handleExportar : undefined}
      />

      {error ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '20px 24px', color: '#dc2626' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
            No se pudo generar el reporte: {(error as any)?.response?.data?.message || (error as Error).message}
          </p>
        </div>
      ) : (
        <>
          <TarjetasKpi totales={totales} isLoading={isLoading} />

          <TablaIngresosVehiculo
            vehiculos={vehiculos}
            totales={totales}
            paginacion={paginacion}
            isLoading={isLoading}
            onPageChange={(page) => setFiltros({ ...filtros, page })}
            onVerDetalle={setVehiculoDetalle}
            onDescargarExcel={handleDescargarExcelVehiculo}
            descargandoExcelId={descargandoExcelId}
          />
        </>
      )}

      <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', color: BLUE }}>info</span>
        {' '}El recaudo se calcula sobre <strong>tiquete.valorcobrado</strong> y se asigna al bus a través del viaje en el que se vendió el tiquete.
      </p>

      <DetalleTiquetesVehiculoModal
        vehiculo={vehiculoDetalle}
        filtros={filtros}
        onClose={() => setVehiculoDetalle(null)}
      />
    </Layout>
  );
};
