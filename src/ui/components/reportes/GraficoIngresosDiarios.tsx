import React from 'react';
import { formatPeso, formatFecha, formatNumero } from '../../../shared/utils/reporteFormat';
import type { IngresoDiario } from '../../../application/dto/ReporteDTO';

const BLUE = '#0D3B8E';
const cardShadow = '0 1px 3px 0 rgba(0,0,0,0.02), 0 1px 2px -1px rgba(0,0,0,0.02)';
const ALTO_GRAFICO = 240;

interface GraficoIngresosDiariosProps {
  datos: IngresoDiario[];
  isLoading: boolean;
}

/** Abrevia un valor en pesos para las etiquetas del eje Y (ej. 1.5M, 850K). */
const abreviar = (valor: number): string => {
  if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(valor >= 10_000_000 ? 0 : 1)}M`;
  if (valor >= 1_000) return `${Math.round(valor / 1_000)}K`;
  return String(Math.round(valor));
};

/**
 * Gráfico de barras de ingresos diarios por venta de tiquetes.
 * Se dibuja con divs para no agregar una dependencia de charting al proyecto.
 */
export const GraficoIngresosDiarios: React.FC<GraficoIngresosDiariosProps> = ({ datos, isLoading }) => {
  const maximo = datos.reduce((max, d) => Math.max(max, d.totalingresos), 0);
  // Se redondea el techo del eje para que las barras no toquen el borde superior.
  const techo = maximo > 0 ? maximo * 1.1 : 1;
  const etiquetasY = [1, 0.75, 0.5, 0.25, 0].map(f => abreviar(techo * f));

  return (
    <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: cardShadow, padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Ingresos Diarios por Tiquetes</h4>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            Recaudo bruto por día en el periodo consultado
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: BLUE, display: 'inline-block' }} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ingresos del día
          </span>
        </div>
      </div>

      {isLoading ? (
        <div style={{ height: `${ALTO_GRAFICO}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>hourglass_empty</span>
          <span style={{ fontSize: '13px' }}>Cargando datos...</span>
        </div>
      ) : datos.length === 0 ? (
        <div style={{ height: `${ALTO_GRAFICO}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>bar_chart</span>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>No hay ventas registradas en el periodo</span>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            {/* Eje Y */}
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              paddingRight: '12px', height: `${ALTO_GRAFICO}px`, textAlign: 'right', minWidth: '46px',
            }}>
              {etiquetasY.map((l, i) => (
                <span key={i} style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: 500, lineHeight: 1 }}>{l}</span>
              ))}
            </div>

            {/* Barras */}
            <div style={{ flex: 1, position: 'relative', height: `${ALTO_GRAFICO}px` }}>
              {[0, 25, 50, 75, 100].map(pct => (
                <div key={pct} style={{ position: 'absolute', left: 0, right: 0, bottom: `${pct}%`, height: '1px', backgroundColor: '#f8fafc' }} />
              ))}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: datos.length > 40 ? '1px' : '4px', height: '100%', padding: '0 4px', position: 'relative' }}>
                {datos.map((d) => {
                  const altoPct = techo > 0 ? (d.totalingresos / techo) * 100 : 0;
                  return (
                    <div
                      key={d.fecha}
                      style={{
                        flex: 1,
                        minWidth: '3px',
                        height: `${Math.max(altoPct, 0.5)}%`,
                        backgroundColor: BLUE,
                        borderRadius: '2px 2px 0 0',
                        transition: 'opacity 0.15s',
                        cursor: 'default',
                      }}
                      title={`${formatFecha(d.fecha)}\n${formatPeso(d.totalingresos)}\n${formatNumero(d.tiquetesvendidos)} tiquetes`}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Eje X: primera y última fecha del periodo con datos */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingLeft: '58px', paddingRight: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {formatFecha(datos[0]?.fecha)}
            </span>
            {datos.length > 1 && (
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {formatFecha(datos[datos.length - 1]?.fecha)}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};
