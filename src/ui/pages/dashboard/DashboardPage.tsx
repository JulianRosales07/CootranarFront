import { useState } from 'react';
import { Layout } from '../../components/layout/Layout';

export const DashboardPage = () => {
  const [selectedSede, setSelectedSede] = useState('pasto-terminal');
  const [selectedTaquillas, setSelectedTaquillas] = useState<string[]>(['taquilla-1', 'taquilla-2']);

  const alturas = [25, 40, 33, 50, 60, 66, 75, 80, 100, 90, 95, 80, 75, 66, 60, 80, 100, 85, 75, 50, 60, 66, 75, 92, 80, 70, 60, 80, 66, 50, 75];

  const ventasPorTaquilla = [
    { sede: 'Pasto Terminal', id: 'T001-PAS', tiquetes: '1,240', encomiendas: '450', total: '$85,400,000' },
    { sede: 'Pasto Terminal', id: 'T002-PAS', tiquetes: '890', encomiendas: '120', total: '$42,220,000' },
    { sede: 'Ipiales Centro', id: 'T001-IPI', tiquetes: '650', encomiendas: '85', total: '$31,100,000' },
    { sede: 'Ipiales Centro', id: 'T002-IPI', tiquetes: '420', encomiendas: '32', total: '$18,450,000' },
    { sede: 'Tumaco Principal', id: 'T001-TUM', tiquetes: '780', encomiendas: '194', total: '$39,280,000' },
  ];

  const navy = '#0D3B8E';
  const cardShadow = '0 1px 3px 0 rgba(0,0,0,0.02), 0 1px 2px -1px rgba(0,0,0,0.02)';

  const getBarBg = (idx: number) => {
    if (idx < 4) return '#e2e8f0';
    if (idx < 8) return 'rgba(13,59,142,0.35)';
    return '#0D3B8E';
  };

  const sedes = [
    { value: 'pasto-terminal', label: 'Pasto Terminal' },
    { value: 'ipiales-centro', label: 'Ipiales Centro' },
    { value: 'tumaco', label: 'Tumaco' },
    { value: 'cali-principal', label: 'Cali Principal' },
  ];

  const taquillas = [
    { value: 'taquilla-1', label: 'Taquilla 1 (Principal)' },
    { value: 'taquilla-2', label: 'Taquilla 2 (Express)' },
    { value: 'taquilla-3', label: 'Taquilla 3' },
    { value: 'taquilla-4', label: 'Taquilla 4' },
    { value: 'taquilla-5', label: 'Taquilla 5' },
  ];

  return (
    <Layout>

      {/* ── FILTROS ─────────────────────────────────── */}
      <div
        className="bg-white rounded border border-slate-200"
        style={{ boxShadow: cardShadow, padding: '24px' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr auto', gap: '0' }}>

          {/* Sede */}
          <div style={{ paddingRight: '24px' }}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Seleccionar Sede</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {sedes.map((s) => (
                <label
                  key={s.value}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px', borderRadius: '6px', cursor: 'pointer',
                    border: selectedSede === s.value ? `1px solid rgba(13,59,142,0.2)` : '1px solid transparent',
                    backgroundColor: selectedSede === s.value ? 'rgba(219,234,254,0.4)' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="sede"
                    value={s.value}
                    checked={selectedSede === s.value}
                    onChange={() => setSelectedSede(s.value)}
                    style={{ accentColor: navy }}
                  />
                  <span style={{
                    fontSize: '14px',
                    color: selectedSede === s.value ? '#334155' : '#64748b',
                    fontWeight: selectedSede === s.value ? '600' : '500',
                  }}>{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Taquillas */}
          <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '24px', paddingRight: '24px' }}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Taquillas Disponibles</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {taquillas.map((t) => (
                <label
                  key={t.value}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTaquillas.includes(t.value)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedTaquillas([...selectedTaquillas, t.value]);
                      else setSelectedTaquillas(selectedTaquillas.filter((x) => x !== t.value));
                    }}
                    style={{ accentColor: navy }}
                  />
                  <span style={{ fontSize: '14px', color: '#475569' }}>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tipo + Fechas */}
          <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '24px', paddingRight: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tipo de Venta</p>
              <select
                className="w-full text-sm text-slate-700"
                style={{
                  border: '1px solid #e2e8f0', borderRadius: '6px',
                  padding: '8px 12px', outline: 'none', backgroundColor: 'white',
                }}
              >
                <option>Tiquetes y Encomiendas</option>
                <option>Tiquetes</option>
                <option>Encomiendas</option>
              </select>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Rango de Fechas</p>
              <div style={{ position: 'relative' }}>
                <span
                  className="material-symbols-outlined"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8', pointerEvents: 'none' }}
                >calendar_today</span>
                <input
                  type="text"
                  defaultValue="Oct 01, 2023 - Oct 31, 2023"
                  className="w-full text-sm text-slate-700"
                  style={{
                    border: '1px solid #e2e8f0', borderRadius: '6px',
                    padding: '8px 12px 8px 34px', outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', minWidth: '140px' }}>
            <button
              className="flex items-center justify-center gap-1.5 text-white text-xs font-bold rounded transition-colors"
              style={{ backgroundColor: navy, padding: '9px 16px' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0a2e70')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = navy)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
              Actualizar
            </button>
            <button
              className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-bold rounded border border-slate-200 hover:bg-slate-50 transition-colors"
              style={{ padding: '9px 16px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* ── MÉTRICAS ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
        {/* Ventas Totales */}
        <div className="bg-white rounded border border-slate-200" style={{ boxShadow: cardShadow, padding: '32px' }}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Ventas Totales</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h3 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>$450.840.000</h3>
            <span className="text-xs font-bold" style={{ color: navy }}>COP</span>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#16a34a' }}>trending_up</span>
            <span className="text-xs text-slate-500">
              <span style={{ color: '#16a34a', fontWeight: '700' }}>+12.5%</span> respecto al mes anterior
            </span>
          </div>
        </div>

        {/* Tiquetes */}
        <div className="bg-white rounded border border-slate-200" style={{ boxShadow: cardShadow, padding: '32px' }}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Tiquetes Vendidos</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h3 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>12.450</h3>
            <span className="text-xs font-bold text-slate-400">UNID</span>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#16a34a' }}>trending_up</span>
            <span className="text-xs text-slate-500">
              <span style={{ color: '#16a34a', fontWeight: '700' }}>+5.2%</span> de incremento en volumen
            </span>
          </div>
        </div>

        {/* Encomiendas */}
        <div className="bg-white rounded border border-slate-200" style={{ boxShadow: cardShadow, padding: '32px' }}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Ingresos Encomiendas</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h3 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>$84.220.000</h3>
            <span className="text-xs font-bold" style={{ color: navy }}>COP</span>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#94a3b8' }}>remove</span>
            <span className="text-xs text-slate-500">Estable comparado con promedio anual</span>
          </div>
        </div>
      </div>

      {/* ── GRÁFICO ─────────────────────────────────── */}
      <div className="bg-white rounded border border-slate-200" style={{ boxShadow: cardShadow, padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Tendencia de Ventas Diarias</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Ingresos brutos diarios expresados en millones de pesos</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: navy, display: 'inline-block' }}></span>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Periodo Actual</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'inline-block' }}></span>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Promedio Mes Ant.</span>
            </div>
          </div>
        </div>

        {/* Chart container */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '0' }}>
          {/* Y-axis labels */}
          <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            paddingRight: '12px', paddingBottom: '0', height: '256px',
            textAlign: 'right',
          }}>
            {['50M', '40M', '30M', '20M', '10M', '0'].map((l) => (
              <span key={l} style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: '500', lineHeight: '1' }}>{l}</span>
            ))}
          </div>

          {/* Bars + gridlines */}
          <div style={{ flex: 1, position: 'relative', height: '256px' }}>
            {/* Gridlines */}
            {[0, 20, 40, 60, 80, 100].map((pct) => (
              <div
                key={pct}
                style={{ position: 'absolute', left: 0, right: 0, bottom: `${pct}%`, height: '1px', backgroundColor: '#f8fafc' }}
              />
            ))}
            {/* Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100%', padding: '0 8px' }}>
              {alturas.map((h, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    backgroundColor: getBarBg(idx),
                    borderRadius: '2px 2px 0 0',
                    transition: 'opacity 0.15s',
                    cursor: 'default',
                  }}
                  title={`Día ${idx + 1}`}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                />
              ))}
            </div>
          </div>
        </div>

        {/* X-axis labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingLeft: '48px', paddingRight: '8px' }}>
          {['Día 01', 'Día 07', 'Día 14', 'Día 21', 'Día 31'].map((d) => (
            <span key={d} style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d}</span>
          ))}
        </div>
      </div>

      {/* ── TABLA ───────────────────────────────────── */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden" style={{ boxShadow: cardShadow }}>
        {/* Table header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Ventas totales por taquilla</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Desglose detallado de rendimiento por punto de venta físico</p>
          </div>
          <button
            style={{ color: navy, fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Descargar CSV
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
          </button>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'rgba(248,250,252,0.5)', borderBottom: '1px solid #f1f5f9' }}>
            <tr>
              {['Sede Operativa', 'ID Taquilla', 'Tiquetes Vendidos', 'Encomiendas', 'Total Recaudado'].map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: '14px 32px',
                    fontSize: '10px', fontWeight: '700', color: '#64748b',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    textAlign: i >= 2 ? (i === 4 ? 'right' : 'center') : 'left',
                  }}
                >{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ventasPorTaquilla.map((v, i) => (
              <tr
                key={i}
                style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(248,250,252,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '16px 32px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{v.sede}</span>
                </td>
                <td style={{ padding: '16px 32px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{v.id}</span>
                </td>
                <td style={{ padding: '16px 32px', textAlign: 'center', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{v.tiquetes}</td>
                <td style={{ padding: '16px 32px', textAlign: 'center', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{v.encomiendas}</td>
                <td style={{ padding: '16px 32px', textAlign: 'right', fontSize: '14px', color: '#0f172a', fontWeight: '700' }}>{v.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: '14px 32px', backgroundColor: 'rgba(248,250,252,0.5)', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>Mostrando 5 de 24 taquillas activas</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { label: 'Anterior', active: false },
              { label: '1', active: true },
              { label: '2', active: false },
              { label: 'Siguiente', active: false },
            ].map((btn) => (
              <button
                key={btn.label}
                style={{
                  padding: '4px 12px', fontSize: '10px', fontWeight: '700',
                  border: btn.active ? `1px solid rgba(13,59,142,0.2)` : '1px solid #e2e8f0',
                  borderRadius: '4px', cursor: 'pointer', transition: 'background 0.1s',
                  backgroundColor: btn.active ? 'white' : 'transparent',
                  color: btn.active ? navy : '#94a3b8',
                }}
              >{btn.label}</button>
            ))}
          </div>
        </div>
      </div>

    </Layout>
  );
};
