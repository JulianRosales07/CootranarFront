import React from 'react';
import { formatPeso, formatNumero, formatFecha } from '../../../shared/utils/reporteFormat';
import type { IngresoVehiculo, TotalesReporte, PaginacionReporte } from '../../../application/dto/ReporteDTO';

const BLUE = '#0D3B8E';
const cardShadow = '0 1px 3px 0 rgba(0,0,0,0.02), 0 1px 2px -1px rgba(0,0,0,0.02)';

const thStyle = (align: 'left' | 'center' | 'right'): React.CSSProperties => ({
  padding: '12px 20px', fontSize: '10px', fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: align,
  borderBottom: '1px solid #e8edf2', whiteSpace: 'nowrap',
});

interface TablaIngresosVehiculoProps {
  vehiculos: IngresoVehiculo[];
  totales: TotalesReporte | null;
  paginacion: PaginacionReporte | null;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onVerDetalle: (vehiculo: IngresoVehiculo) => void;
  /** Descarga el reporte contable en Excel de un bus puntual. */
  onDescargarExcel?: (vehiculo: IngresoVehiculo) => void;
  /** Id del bus cuyo Excel se está generando, para mostrar el estado de carga. */
  descargandoExcelId?: number | null;
}

/**
 * Tabla del reporte contable: una fila por bus con su recaudo del periodo,
 * más una fila de totales generales para cuadre contable.
 */
export const TablaIngresosVehiculo: React.FC<TablaIngresosVehiculoProps> = ({
  vehiculos,
  totales,
  paginacion,
  isLoading,
  onPageChange,
  onVerDetalle,
  onDescargarExcel,
  descargandoExcelId,
}) => {
  const page = paginacion?.paginaActual ?? 1;
  const totalPaginas = paginacion?.totalPaginas ?? 1;

  return (
    <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: cardShadow, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Ingresos por Bus
        </h4>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
          Recaudo por venta de tiquetes de cada vehículo en el periodo, ordenado de mayor a menor
        </p>
      </div>

      {isLoading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>hourglass_empty</span>
          <span style={{ fontSize: '13px' }}>Generando reporte...</span>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={thStyle('left')}>Móvil / Placa</th>
                  <th style={thStyle('left')}>Tipo de Bus</th>
                  <th style={thStyle('left')}>Propietario</th>
                  <th style={thStyle('center')}>Viajes</th>
                  <th style={thStyle('center')}>Tiquetes</th>
                  <th style={thStyle('right')}>Ticket Prom.</th>
                  <th style={thStyle('right')}>Total Recaudado</th>
                  <th style={thStyle('center')}>Periodo con ventas</th>
                  <th style={thStyle('center')}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No hay ingresos por tiquetes registrados con los filtros seleccionados.
                    </td>
                  </tr>
                ) : vehiculos.map((v) => (
                  <tr
                    key={v.idvehiculo}
                    style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,250,252,0.8)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>Móvil {v.numeromovil}</div>
                      <div style={{ fontSize: '11.5px', fontFamily: 'monospace', color: '#94a3b8' }}>{v.placa}</div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>
                      {v.nombretipobus || '—'}
                      {v.nombretiposervicio && (
                        <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{v.nombretiposervicio}</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>
                      {v.nombrepropietario || '—'}
                      {v.documentopropietario && (
                        <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>CC {v.documentopropietario}</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: '13px', color: '#475569' }}>{formatNumero(v.totalviajes)}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: '13px', color: '#475569', fontWeight: 600 }}>{formatNumero(v.tiquetesvendidos)}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: '13px', color: '#64748b' }}>{formatPeso(v.promediotiquete)}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: '14px', color: '#0f172a', fontWeight: 700 }}>{formatPeso(v.totalingresos)}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: '11.5px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {formatFecha(v.primeraventa)} — {formatFecha(v.ultimaventa)}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          onClick={() => onVerDetalle(v)}
                          title="Ver tiquetes de este bus"
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', display: 'inline-flex' }}
                          onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
                          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>receipt_long</span>
                        </button>
                        {onDescargarExcel && (
                          <button
                            onClick={() => onDescargarExcel(v)}
                            disabled={descargandoExcelId === v.idvehiculo}
                            title={`Descargar Excel del móvil ${v.numeromovil}`}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: descargandoExcelId === v.idvehiculo ? 'default' : 'pointer', color: descargandoExcelId === v.idvehiculo ? '#cbd5e1' : '#94a3b8', display: 'inline-flex' }}
                            onMouseEnter={e => { if (descargandoExcelId !== v.idvehiculo) e.currentTarget.style.color = '#15803d'; }}
                            onMouseLeave={e => { if (descargandoExcelId !== v.idvehiculo) e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                              {descargandoExcelId === v.idvehiculo ? 'hourglass_empty' : 'download'}
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              {vehiculos.length > 0 && totales && (
                <tfoot>
                  <tr style={{ background: '#eff6ff', borderTop: `2px solid ${BLUE}` }}>
                    <td colSpan={3} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Total general del periodo
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>{formatNumero(totales.totalviajes)}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>{formatNumero(totales.tiquetesvendidos)}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>{formatPeso(totales.promediotiquete)}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: '15px', fontWeight: 800, color: '#1e40af' }}>{formatPeso(totales.totalingresos)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div style={{ padding: '13px 24px', background: 'rgba(248,250,252,0.5)', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Mostrando <strong style={{ color: '#475569' }}>{vehiculos.length}</strong> de{' '}
              <strong style={{ color: '#475569' }}>{paginacion?.total ?? 0}</strong> buses con ventas
            </span>
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                  style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 700, border: '1px solid #e2e8f0', borderRadius: '5px', background: 'white', color: page === 1 ? '#cbd5e1' : '#64748b', cursor: page === 1 ? 'default' : 'pointer', fontFamily: 'inherit' }}
                >
                  Anterior
                </button>
                <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, padding: '0 4px' }}>
                  Página {page} de {totalPaginas}
                </span>
                <button
                  onClick={() => onPageChange(page + 1)}
                  disabled={page === totalPaginas}
                  style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 700, border: '1px solid #e2e8f0', borderRadius: '5px', background: 'white', color: page === totalPaginas ? '#cbd5e1' : '#64748b', cursor: page === totalPaginas ? 'default' : 'pointer', fontFamily: 'inherit' }}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
