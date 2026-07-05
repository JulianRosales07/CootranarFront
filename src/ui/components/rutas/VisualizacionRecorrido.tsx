import React from 'react';

export interface NodoRecorrido {
  label: string;
  tipo: 'origen' | 'destino' | 'agencia' | 'parada';
  tiempoH?: number;
  tiempoM?: number;
}

const formatHM = (h?: number, m?: number): string => {
  const hh = parseInt(String(h)) || 0;
  const mm = parseInt(String(m)) || 0;
  if (!hh && !mm) return '';
  if (hh && mm) return `${hh}h ${mm}min`;
  return hh ? `${hh}h` : `${mm}min`;
};

/**
 * Visualización gráfica del recorrido de una ruta como línea de nodos.
 * - Origen: bolita verde sólida
 * - Destino: bolita negra sólida
 * - Punto con agencia: bolita verde borde (puede vender)
 * - Parada simple: bolita gris con borde dashed
 * 
 * Muestra tiempos entre puntos sobre las conexiones.
 */
export const VisualizacionRecorrido: React.FC<{ nodos: NodoRecorrido[] }> = ({ nodos }) => {
  if (nodos.length < 2) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', padding: '8px 0' }}>
      {nodos.map((n, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Conector con tiempo */}
          {i > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 4px' }}>
              <span style={{ fontSize: '9px', color: '#94a3b8', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                {formatHM(n.tiempoH, n.tiempoM)}
              </span>
              <div style={{ width: '28px', height: '2px', background: '#d1d5db' }} />
            </div>
          )}
          {/* Nodo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', minWidth: '60px' }}>
            <div style={{
              width: n.tipo === 'parada' ? '24px' : '30px',
              height: n.tipo === 'parada' ? '24px' : '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 700,
              ...getNodoStyle(n.tipo),
            }}>
              {n.label.substring(0, 2).toUpperCase()}
            </div>
            <span style={{ fontSize: '9px', color: '#64748b', textAlign: 'center', whiteSpace: 'nowrap', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {n.label}
            </span>
            {(n.tipo === 'origen' || n.tipo === 'agencia') && (
              <span style={{ fontSize: '8px', color: '#0D3B8E', fontWeight: 600 }}>★ vende</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

function getNodoStyle(tipo: NodoRecorrido['tipo']): React.CSSProperties {
  switch (tipo) {
    case 'origen':
      return { background: '#0D3B8E', color: 'white' };
    case 'destino':
      return { background: '#1e293b', color: 'white' };
    case 'agencia':
      return { background: '#a1c2ffff', color: '#0D3B8E', border: '2px solid #0D3B8E' };
    case 'parada':
      return { background: 'white', color: '#94a3b8', border: '1px dashed #d1d5db' };
  }
}
