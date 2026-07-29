import React from 'react';
import { formatPeso, formatNumero } from '../../../shared/utils/reporteFormat';
import type { TotalesReporte } from '../../../application/dto/ReporteDTO';

const BLUE = '#0D3B8E';
const cardShadow = '0 1px 3px 0 rgba(0,0,0,0.02), 0 1px 2px -1px rgba(0,0,0,0.02)';

interface Kpi {
  label: string;
  valor: string;
  sufijo?: string;
  detalle: string;
  icono: string;
}

interface TarjetasKpiProps {
  totales: TotalesReporte | null;
  isLoading: boolean;
}

/**
 * Tarjetas de indicadores del periodo consultado, alimentadas con datos reales
 * del backend (no hay valores simulados).
 */
export const TarjetasKpi: React.FC<TarjetasKpiProps> = ({ totales, isLoading }) => {
  const kpis: Kpi[] = [
    {
      label: 'Ingresos por Tiquetes',
      valor: formatPeso(totales?.totalingresos),
      sufijo: 'COP',
      detalle: `${formatNumero(totales?.totalviajes)} viajes con ventas registradas`,
      icono: 'payments',
    },
    {
      label: 'Tiquetes Vendidos',
      valor: formatNumero(totales?.tiquetesvendidos),
      sufijo: 'UNID',
      detalle: `Ticket promedio de ${formatPeso(totales?.promediotiquete)}`,
      icono: 'confirmation_number',
    },
    {
      label: 'Buses con Ingresos',
      valor: formatNumero(totales?.totalvehiculos),
      sufijo: 'BUSES',
      detalle: `${formatNumero(totales?.totaloficinas)} oficinas con ventas`,
      icono: 'directions_bus',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
      {kpis.map((kpi) => (
        <div key={kpi.label} style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: cardShadow, padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
              {kpi.label}
            </p>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#cbd5e1' }}>{kpi.icono}</span>
          </div>

          {isLoading ? (
            <div style={{ height: '30px', width: '60%', background: '#f1f5f9', borderRadius: '6px' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', lineHeight: 1, margin: 0 }}>{kpi.valor}</h3>
              {kpi.sufijo && <span style={{ fontSize: '11px', fontWeight: 700, color: BLUE }}>{kpi.sufijo}</span>}
            </div>
          )}

          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f8fafc' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{isLoading ? 'Cargando...' : kpi.detalle}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
