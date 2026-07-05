import { Layout } from '../../components/layout/Layout';

export const TiquetesPage = () => {
  return (
    <Layout>
      <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Mensaje temporal */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f1f5f9',
          padding: '64px',
          textAlign: 'center'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#cbd5e1' }}>
            confirmation_number
          </span>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '16px 0 8px 0' }}>
            Gestión de Tiquetes
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Esta sección está en desarrollo. Por ahora, puede vender tiquetes desde la sección de Taquilla.
          </p>
        </div>
      </div>
    </Layout>
  );
};
