import React from 'react';

interface Props {
  requeridas: number;
  configuradas: number;
  porcentaje: number;
}

export const BarraCompletitud: React.FC<Props> = ({ requeridas, configuradas, porcentaje }) => {
  const color = porcentaje < 50 ? '#f59e0b' : '#22c55e';
  const bgColor = porcentaje < 50 ? '#fef3c7' : '#dcfce7';
  const textColor = porcentaje < 50 ? '#92400e' : '#166534';

  return (
    <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Completitud de tarifas</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
          {configuradas} / {requeridas} combinaciones
        </span>
      </div>
      
      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${porcentaje}%`,
            background: color,
            borderRadius: '999px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div style={{ marginTop: '12px', padding: '12px', background: bgColor, borderRadius: '8px' }}>
        <p style={{ fontSize: '12px', color: textColor, margin: 0, lineHeight: '1.5' }}>
          {porcentaje === 100 ? (
            <>
              <span style={{ fontWeight: 700 }}>✓ Todas las tarifas configuradas.</span> El sistema puede vender todos los tramos.
            </>
          ) : porcentaje === 0 ? (
            <>
              <span style={{ fontWeight: 700 }}>⚠ Sin tarifas.</span> No se pueden vender tiquetes para esta ruta.
            </>
          ) : (
            <>
              <span style={{ fontWeight: 700 }}>⚠ Faltan {requeridas - configuradas} tarifa(s).</span> Algunos tramos no pueden venderse.
            </>
          )}
        </p>
      </div>
    </div>
  );
};
