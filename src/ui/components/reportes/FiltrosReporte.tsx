import React from 'react';
import type { FiltrosReporte as Filtros } from '../../../application/dto/ReporteDTO';

const BLUE = '#0D3B8E';

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '8px 12px',
  border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '13px',
  color: '#334155', outline: 'none', background: 'white', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: 700, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px',
};

interface FiltrosReporteProps {
  filtros: Filtros;
  onChange: (filtros: Filtros) => void;
  cargando?: boolean;
  onExportar?: () => void;
  /** Oculta el filtro de origen cuando no aplica. */
  ocultarOrigen?: boolean;
}

/**
 * Barra de filtros compartida por el dashboard y el reporte de ingresos:
 * rango de fechas, canal de venta y si se incluyen tiquetes sin facturar.
 */
export const FiltrosReporte: React.FC<FiltrosReporteProps> = ({
  filtros,
  onChange,
  cargando,
  onExportar,
  ocultarOrigen,
}) => {
  const set = (cambios: Partial<Filtros>) => onChange({ ...filtros, ...cambios, page: 1 });

  return (
    <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e8edf2', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
          <label style={labelStyle}>Desde</label>
          <input
            type="date"
            value={filtros.fechaDesde || ''}
            onChange={e => set({ fechaDesde: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
          <label style={labelStyle}>Hasta</label>
          <input
            type="date"
            value={filtros.fechaHasta || ''}
            onChange={e => set({ fechaHasta: e.target.value })}
            style={inputStyle}
          />
        </div>

        {!ocultarOrigen && (
          <div style={{ flex: '1 1 170px', minWidth: '160px' }}>
            <label style={labelStyle}>Canal de venta</label>
            <select
              value={filtros.origen || ''}
              onChange={e => set({ origen: e.target.value as Filtros['origen'] })}
              style={{ ...inputStyle, appearance: 'none' }}
            >
              <option value="">Todos los canales</option>
              <option value="Taquilla">Taquilla</option>
              <option value="E-commerce">E-commerce</option>
            </select>
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '9px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!filtros.incluirPendientes}
            onChange={e => set({ incluirPendientes: e.target.checked })}
            style={{ accentColor: BLUE }}
          />
          <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
            Incluir tiquetes sin facturar
          </span>
        </label>

        {onExportar && (
          <button
            onClick={onExportar}
            disabled={cargando}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: 'white', color: BLUE,
              border: `1px solid ${BLUE}`, borderRadius: '7px', padding: '9px 16px', fontSize: '12.5px',
              fontWeight: 700, cursor: cargando ? 'default' : 'pointer', fontFamily: 'inherit',
              opacity: cargando ? 0.6 : 1, whiteSpace: 'nowrap',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>download</span>
            Exportar Excel
          </button>
        )}
      </div>

      <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '12px 0 0' }}>
        Por defecto solo se contabilizan tiquetes con factura electrónica aprobada por la DIAN.
      </p>
    </div>
  );
};
