import React from 'react';

interface PuntoExpandido {
  idpuntoruta: number;
  nombre: string;
  idagencia: number | null;
  orden: number;
  tiempodesdeanteriorth: number;
  tiempodesdeanteriorm: number;
}

const formatHM = (h: number, m: number) => {
  h = parseInt(String(h)) || 0;
  m = parseInt(String(m)) || 0;
  if (!h && !m) return '';
  if (h && m) return `${h}h ${m}min`;
  return h ? `${h}h` : `${m}min`;
};

export const FilaPuntosExpandidos: React.FC<{ puntos: PuntoExpandido[]; colSpan: number }> = ({ puntos, colSpan }) => {
  if (puntos.length === 0) {
    return (
      <tr><td colSpan={colSpan} style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Sin puntos registrados</span>
      </td></tr>
    );
  }

  return (
    <tr><td colSpan={colSpan} style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#0D3B8E' }}>route</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Recorrido completo</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        {puntos.map((p, i) => {
          const isFirst = i === 0;
          const isLast = i === puntos.length - 1;
          const bg = isFirst ? '#f0fdf4' : isLast ? '#f1f5f9' : p.idagencia ? '#f0fdf4' : 'white';
          const border = isFirst ? '1px solid #bbf7d0' : isLast ? '1px solid #e2e8f0' : p.idagencia ? '1px solid #bbf7d0' : '1px dashed #e2e8f0';
          const time = formatHM(p.tiempodesdeanteriorth, p.tiempodesdeanteriorm);

          return (
            <React.Fragment key={p.idpuntoruta}>
              {i > 0 && <div style={{ width: '24px', height: '2px', background: '#d1d5db' }} />}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 10px', borderRadius: '8px', minWidth: '70px', background: bg, border }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textAlign: 'center', whiteSpace: 'nowrap' }}>{p.nombre}</span>
                {p.idagencia && <span style={{ fontSize: '9px', color: '#16a34a' }}>★ agencia</span>}
                {time && <span style={{ fontSize: '9px', color: '#94a3b8' }}>{time}</span>}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </td></tr>
  );
};
