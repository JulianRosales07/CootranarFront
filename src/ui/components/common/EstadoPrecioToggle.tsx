import { useConfiguracionSistema, ESTADOS_PRECIO } from '../../hooks/useConfiguracionSistema';

export const EstadoPrecioToggle = () => {
  const { estadoPrecio, cambiarEstado, isLoading, esTraficoAlto } = useConfiguracionSistema();

  const handleToggle = () => {
    const nuevoEstado = esTraficoAlto ? ESTADOS_PRECIO.NORMAL : ESTADOS_PRECIO.TRAFICO_ALTO;
    cambiarEstado.mutate(nuevoEstado);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        padding: '8px 16px',
        background: '#f8fafc',
        borderRadius: '8px'
      }}>
        <span style={{ fontSize: '13px', color: '#64748b' }}>Cargando...</span>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px',
      padding: '8px 16px',
      background: esTraficoAlto ? '#fef2f2' : '#f0fdf4',
      borderRadius: '8px',
      border: `1px solid ${esTraficoAlto ? '#fecaca' : '#bbf7d0'}`
    }}>
      <span style={{ 
        fontSize: '13px', 
        fontWeight: 600,
        color: esTraficoAlto ? '#dc2626' : '#16a34a'
      }}>
        {esTraficoAlto ? '🔴 Tráfico Alto' : '🟢 Tráfico Normal'}
      </span>
      
      <button
        onClick={handleToggle}
        disabled={cambiarEstado.isPending}
        style={{
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'white',
          background: esTraficoAlto ? '#16a34a' : '#dc2626',
          border: 'none',
          borderRadius: '6px',
          cursor: cambiarEstado.isPending ? 'not-allowed' : 'pointer',
          opacity: cambiarEstado.isPending ? 0.6 : 1,
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => {
          if (!cambiarEstado.isPending) {
            e.currentTarget.style.opacity = '0.9';
          }
        }}
        onMouseLeave={e => {
          if (!cambiarEstado.isPending) {
            e.currentTarget.style.opacity = '1';
          }
        }}
      >
        {cambiarEstado.isPending 
          ? 'Cambiando...' 
          : `Cambiar a ${esTraficoAlto ? 'Normal' : 'Tráfico Alto'}`
        }
      </button>
    </div>
  );
};
