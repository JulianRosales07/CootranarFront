import React from 'react';
import { useDetalleTiquetesVehiculo } from '../../hooks/useReportes';
import { formatPeso, formatFecha, formatFechaHora, formatNumero, exportarExcel } from '../../../shared/utils/reporteFormat';
import type { ColumnaExport } from '../../../shared/utils/reporteFormat';
import type { FiltrosReporte, IngresoVehiculo, DetalleTiquete } from '../../../application/dto/ReporteDTO';

const BLUE = '#0D3B8E';

const thStyle: React.CSSProperties = {
  padding: '10px 14px', fontSize: '10px', fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left',
  borderBottom: '1px solid #e8edf2', whiteSpace: 'nowrap', background: '#f8fafc',
  position: 'sticky', top: 0,
};

const tdStyle: React.CSSProperties = {
  padding: '10px 14px', fontSize: '12.5px', color: '#475569', borderBottom: '1px solid #f8fafc',
};

interface DetalleTiquetesVehiculoModalProps {
  vehiculo: IngresoVehiculo | null;
  filtros: FiltrosReporte;
  onClose: () => void;
}

/**
 * Drill-down contable: lista los tiquetes individuales que componen el recaudo
 * de un bus, con su CUFE y método de pago para conciliación.
 */
export const DetalleTiquetesVehiculoModal: React.FC<DetalleTiquetesVehiculoModalProps> = ({
  vehiculo,
  filtros,
  onClose,
}) => {
  const idVehiculo = vehiculo ? String(vehiculo.idvehiculo) : null;
  // Se pide un límite alto porque este listado es para revisión contable completa.
  const { tiquetes, paginacion, isLoading } = useDetalleTiquetesVehiculo(idVehiculo, { ...filtros, page: 1, limit: 200 });

  if (!vehiculo) return null;

  const columnas: ColumnaExport<DetalleTiquete>[] = [
    { key: 'codigotiquete', label: 'Código Tiquete' },
    { key: 'fechaexpedicion', label: 'Fecha Expedición' },
    { key: 'nombreruta', label: 'Ruta' },
    { key: 'origennombre', label: 'Origen' },
    { key: 'destinonombre', label: 'Destino' },
    { key: 'numeroasiento', label: 'Asiento', numero: true },
    { key: 'nombrepasajero', label: 'Pasajero' },
    { key: 'documentopasajero', label: 'Documento' },
    { key: 'nombretaquillero', label: 'Vendido por' },
    { key: 'codigooficina', label: 'Oficina' },
    { key: 'nombremetodopago', label: 'Método de Pago' },
    { key: 'formapago', label: 'Forma de Pago' },
    { key: 'origen', label: 'Canal' },
    { key: 'estadofactura', label: 'Estado Factura' },
    { key: 'cufe', label: 'CUFE' },
    { key: 'valorcobrado', label: 'Valor Cobrado', moneda: true },
  ];

  const handleExportar = () => {
    exportarExcel(
      `tiquetes-movil-${vehiculo.numeromovil}-${filtros.fechaDesde || 'inicio'}-a-${filtros.fechaHasta || 'hoy'}`,
      columnas,
      tiquetes,
      {
        nombreHoja: 'Detalle tiquetes',
        hojasExtra: [{
          nombre: 'Resumen',
          filas: [
            ['Reporte', `Tiquetes del móvil ${vehiculo.numeromovil}`],
            ['Placa', vehiculo.placa],
            ['Periodo', `${formatFecha(filtros.fechaDesde)} a ${formatFecha(filtros.fechaHasta)}`],
            [],
            ['Tiquetes vendidos (periodo)', vehiculo.tiquetesvendidos],
            ['Total recaudado (periodo)', vehiculo.totalingresos],
            ['Tiquetes en este archivo', tiquetes.length],
            ['Generado', new Date().toLocaleString('es-CO')],
          ],
        }],
      }
    );
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '1100px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Tiquetes del Móvil {vehiculo.numeromovil} · {vehiculo.placa}
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0' }}>
              {formatNumero(vehiculo.tiquetesvendidos)} tiquetes · {formatPeso(vehiculo.totalingresos)} recaudado
              {filtros.fechaDesde || filtros.fechaHasta
                ? ` · ${formatFecha(filtros.fechaDesde) } a ${formatFecha(filtros.fechaHasta)}`
                : ' · todo el histórico'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleExportar}
              disabled={isLoading || tiquetes.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: BLUE, border: `1px solid ${BLUE}`, borderRadius: '7px', padding: '8px 14px', fontSize: '12px', fontWeight: 700, cursor: isLoading || tiquetes.length === 0 ? 'default' : 'pointer', fontFamily: 'inherit', opacity: isLoading || tiquetes.length === 0 ? 0.5 : 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
              Exportar Excel
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>hourglass_empty</span>
              <span style={{ fontSize: '13px' }}>Cargando tiquetes...</span>
            </div>
          ) : tiquetes.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No hay tiquetes para este bus con los filtros aplicados.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Código', 'Expedición', 'Ruta / Tramo', 'Asiento', 'Pasajero', 'Vendido por', 'Pago', 'Canal', 'Valor'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tiquetes.map(t => (
                  <tr key={t.idtiquete}>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                      {t.codigotiquete || `#${t.idtiquete}`}
                      {t.estadofactura !== 'APROBADA' && (
                        <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: 700 }}>SIN FACTURAR</div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{formatFechaHora(t.fechaexpedicion)}</td>
                    <td style={tdStyle}>
                      {t.nombreruta || '—'}
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.origennombre} → {t.destinonombre}</div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{t.numeroasiento ?? '—'}</td>
                    <td style={tdStyle}>
                      {t.nombrepasajero || '—'}
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.documentopasajero}</div>
                    </td>
                    <td style={tdStyle}>
                      {t.nombretaquillero}
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.codigooficina || '—'}</div>
                    </td>
                    <td style={tdStyle}>
                      {t.nombremetodopago || '—'}
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.formapago || '—'}</div>
                    </td>
                    <td style={tdStyle}>{t.origen || '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>{formatPeso(t.valorcobrado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && tiquetes.length > 0 && (
          <div style={{ padding: '12px 24px', borderTop: '1px solid #f1f5f9', background: 'rgba(248,250,252,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
              Mostrando {tiquetes.length} de {paginacion?.total ?? tiquetes.length} tiquetes
              {(paginacion?.total ?? 0) > tiquetes.length && ' (usa el botón de Excel de la tabla para el detalle completo)'}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
              Suma mostrada: {formatPeso(tiquetes.reduce((s, t) => s + t.valorcobrado, 0))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
