import React from 'react';
import { VisualizacionRecorrido, type NodoRecorrido } from './VisualizacionRecorrido';

interface PuntoExpandido {
  idpuntoruta: number;
  nombre: string;
  idagencia: number | null;
  orden: number;
  tiempodesdeanteriorth: number;
  tiempodesdeanteriorm: number;
}

export const FilaPuntosExpandidos: React.FC<{ puntos: PuntoExpandido[]; colSpan: number }> = ({ puntos, colSpan }) => {
  if (puntos.length === 0) {
    return (
      <tr><td colSpan={colSpan} style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', }}>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Sin puntos registrados</span>
      </td></tr>
    );
  }

  // Construir nodos para la visualización gráfica
  const nodos: NodoRecorrido[] = puntos
    .sort((a, b) => a.orden - b.orden)
    .map((p, i) => {
      const isFirst = i === 0;
      const isLast = i === puntos.length - 1;
      let tipo: NodoRecorrido['tipo'] = 'parada';
      if (isFirst) tipo = 'origen';
      else if (isLast) tipo = 'destino';
      else if (p.idagencia) tipo = 'agencia';
      return {
        label: p.nombre,
        tipo,
        tiempoH: p.tiempodesdeanteriorth,
        tiempoM: p.tiempodesdeanteriorm,
      };
    });

  return (
    <tr><td colSpan={colSpan} style={{ padding: '20px 24px', paddingTop: '100px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '30px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#0D3B8E' }}>route</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Recorrido completo</span>
      </div>
      {/* Diagrama visual de nodos */}
      <div style={{ overflowX: 'auto' }}>
        <VisualizacionRecorrido nodos={nodos} />
      </div>
    </td></tr>
  );
};
