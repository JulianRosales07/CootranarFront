import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useResumenDashboard } from '../../hooks/useReportes';
import { FiltrosReporte } from '../../components/reportes/FiltrosReporte';
import { TarjetasKpi } from '../../components/reportes/TarjetasKpi';
import { GraficoIngresosDiarios } from '../../components/reportes/GraficoIngresosDiarios';
import { formatPeso, formatNumero, rangoMesActual, exportarExcel, formatFecha } from '../../../shared/utils/reporteFormat';
import type { ColumnaExport } from '../../../shared/utils/reporteFormat';
import type { IngresoOficina } from '../../../application/dto/ReporteDTO';
import { ROUTES } from '../../../shared/constants';
import type { FiltrosReporte as Filtros } from '../../../application/dto/ReporteDTO';

const BLUE = '#0D3B8E';
const cardShadow = '0 1px 3px 0 rgba(0,0,0,0.02), 0 1px 2px -1px rgba(0,0,0,0.02)';

const thStyle = (align: 'left' | 'center' | 'right'): React.CSSProperties => ({
  padding: '12px 24px', fontSize: '10px', fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: align,
  borderBottom: '1px solid #e8edf2', whiteSpace: 'nowrap',
});

export const DashboardPage = () => {
  const [filtros, setFiltros] = useState<Filtros>({ ...rangoMesActual() });

  const { totales, ingresosDiarios, ingresosPorOficina, isLoading, isFetching, error } =
    useResumenDashboard(filtros);

  const handleExportarOficinas = () => {
    const columnas: ColumnaExport<IngresoOficina>[] = [
      { key: 'nombreagencia', label: 'Agencia' },
      { key: 'nombreciudad', label: 'Ciudad' },
      { key: 'codigooficina', label: 'Oficina' },
      { key: 'tiquetesvendidos', label: 'Tiquetes Vendidos', numero: true },
      { key: 'totalingresos', label: 'Total Recaudado', moneda: true },
    ];

    exportarExcel(
      `ventas-por-oficina-${filtros.fechaDesde || 'inicio'}-a-${filtros.fechaHasta || 'hoy'}`,
      columnas,
      ingresosPorOficina,
      {
        nombreHoja: 'Ventas por oficina',
        hojasExtra: [{
          nombre: 'Resumen',
          filas: [
            ['Reporte', 'Ventas de tiquetes por oficina'],
            ['Periodo', `${formatFecha(filtros.fechaDesde)} a ${formatFecha(filtros.fechaHasta)}`],
            ['Canal de venta', filtros.origen || 'Todos'],
            ['Incluye sin facturar', filtros.incluirPendientes ? 'Sí' : 'No'],
            [],
            ['Oficinas con ventas', totales?.totaloficinas ?? 0],
            ['Tiquetes vendidos', totales?.tiquetesvendidos ?? 0],
            ['Total recaudado', totales?.totalingresos ?? 0],
            [],
            ['Generado', new Date().toLocaleString('es-CO')],
          ],
        }],
      }
    );
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Dashboard</h2>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0' }}>
            Resumen de ingresos por venta de tiquetes en el periodo seleccionado.
          </p>
        </div>
        <Link
          to={ROUTES.REPORTE_INGRESOS}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: BLUE, color: 'white', textDecoration: 'none', borderRadius: '7px', padding: '10px 18px', fontSize: '13px', fontWeight: 700 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>request_quote</span>
          Reporte de Ingresos por Bus
        </Link>
      </div>

      <FiltrosReporte filtros={filtros} onChange={setFiltros} cargando={isFetching} />

      {error ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '20px 24px', color: '#dc2626' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
            No se pudo cargar el dashboard: {(error as any)?.response?.data?.message || (error as Error).message}
          </p>
        </div>
      ) : (
        <>
          <TarjetasKpi totales={totales} isLoading={isLoading} />

          <GraficoIngresosDiarios datos={ingresosDiarios} isLoading={isLoading} />

          {/* Ventas por oficina */}
          <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: cardShadow, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Ventas de Tiquetes por Oficina</h4>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Desglose del recaudo por punto de venta
                </p>
              </div>
              {ingresosPorOficina.length > 0 && (
                <button
                  onClick={handleExportarOficinas}
                  style={{ color: BLUE, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Descargar Excel
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                </button>
              )}
            </div>

            {isLoading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>hourglass_empty</span>
                <span style={{ fontSize: '13px' }}>Cargando ventas por oficina...</span>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'rgba(248,250,252,0.5)' }}>
                    <tr>
                      <th style={thStyle('left')}>Agencia</th>
                      <th style={thStyle('left')}>Ciudad</th>
                      <th style={thStyle('left')}>Oficina</th>
                      <th style={thStyle('center')}>Tiquetes Vendidos</th>
                      <th style={thStyle('right')}>Total Recaudado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresosPorOficina.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                          No hay ventas registradas en el periodo seleccionado.
                        </td>
                      </tr>
                    ) : ingresosPorOficina.map((o, i) => (
                      <tr
                        key={`${o.idoficina ?? 'sin'}-${i}`}
                        style={{ borderBottom: '1px solid #f8fafc' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,250,252,0.8)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>
                          {o.nombreagencia || 'Sin agencia'}
                        </td>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#475569' }}>{o.nombreciudad || '—'}</td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{ fontSize: '11.5px', fontFamily: 'monospace', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                            {o.codigooficina || 'E-commerce'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'center', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                          {formatNumero(o.tiquetesvendidos)}
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'right', fontSize: '14px', color: '#0f172a', fontWeight: 700 }}>
                          {formatPeso(o.totalingresos)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {ingresosPorOficina.length > 0 && totales && (
                    <tfoot>
                      <tr style={{ background: '#eff6ff', borderTop: `2px solid ${BLUE}` }}>
                        <td colSpan={3} style={{ padding: '14px 24px', fontSize: '12px', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Total del periodo
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
                          {formatNumero(totales.tiquetesvendidos)}
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'right', fontSize: '15px', fontWeight: 800, color: '#1e40af' }}>
                          {formatPeso(totales.totalingresos)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};
