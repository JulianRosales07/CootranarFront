import React from 'react';

interface ConfigPasajero {
  tipoPasajero: 'adulto' | 'nino';
  tramo?: any;
  idasientoviaje?: number;
  numerAsiento?: number;
}

interface IndicadorProgresoPasajeroProps {
  pasajeros: ConfigPasajero[];
  indiceActual: number;
  subfase: 'tramo' | 'asiento';
}

function estadoPasajero(p: ConfigPasajero, idx: number, actual: number): 'completado' | 'activo' | 'pendiente' {
  if (p.idasientoviaje) return 'completado';
  if (idx === actual) return 'activo';
  return 'pendiente';
}

export const IndicadorProgresoPasajero: React.FC<IndicadorProgresoPasajeroProps> = ({
  pasajeros,
  indiceActual,
  subfase: _subfase,
}) => {
  const completados = pasajeros.filter(p => p.idasientoviaje).length;
  // Let the progress represent the active passenger's progress block
  const progressPct = pasajeros.length > 0 ? Math.round(((indiceActual + 1) / pasajeros.length) * 100) : 0;

  return (
    <div style={{
      background: '#fff',
      padding: '16px 24px',
      fontFamily: "'Hanken Grotesk', 'Inter', sans-serif",
      borderBottom: '1px solid #f1f5f9'
    }}>
      {/* Barra superior */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#0f172a' }}>person</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            Pasajero {indiceActual + 1} de {pasajeros.length}
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: '9999px',
            background: '#1e293b',
            color: '#ffffff',
            letterSpacing: '0.5px'
          }}>
            IN PROGRESS
          </span>
        </div>
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
          {completados}/{pasajeros.length} listos
        </span>
      </div>

      {/* Progreso general (Sleek Black Line) */}
      <div style={{ height: 3, background: '#eff3f9', borderRadius: 100, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: '#000000',
          borderRadius: 100,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Avatares de pasajeros (subtly styled at the bottom) */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {pasajeros.map((p, idx) => {
          const estado = estadoPasajero(p, idx, indiceActual);
          const isActive = estado === 'activo';
          const isCompleted = estado === 'completado';

          return (
            <div
              key={idx}
              title={`${p.tipoPasajero === 'adulto' ? 'Adulto' : 'Niño'} ${idx + 1}${p.numerAsiento ? ` • Asiento ${p.numerAsiento}` : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 20,
                border: `1.5px solid ${isActive ? '#000000' : isCompleted ? '#22c55e' : '#e2e8f0'}`,
                background: isActive ? '#f8fafc' : isCompleted ? '#f0fdf4' : '#ffffff',
                boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{
                fontSize: 14,
                color: isCompleted ? '#22c55e' : isActive ? '#000000' : '#94a3b8',
              }}>
                {isCompleted ? 'check_circle' : p.tipoPasajero === 'adulto' ? 'person' : 'child_care'}
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: isCompleted ? '#15803d' : isActive ? '#000000' : '#64748b',
              }}>
                {p.tipoPasajero === 'adulto' ? 'Pasajero' : 'Niño'} {idx + 1}
                {p.numerAsiento ? ` · Asiento ${p.numerAsiento}` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
