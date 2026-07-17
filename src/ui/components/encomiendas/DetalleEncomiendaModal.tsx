import React from 'react';
import type { EncomiendaDTO } from '../../../application/dto/EncomiendaDTO';

const ESTADOS: Record<string, { bg: string; color: string; texto: string }> = {
  COTIZADA: { bg: '#f1f5f9', color: '#475569', texto: 'COTIZADA' },
  REGISTRADA: { bg: '#dbeafe', color: '#1d4ed8', texto: 'REGISTRADA' },
  EN_TRANSITO: { bg: '#fef9c3', color: '#a16207', texto: 'EN TRÁNSITO' },
  EN_DESTINO: { bg: '#e0f2fe', color: '#0369a1', texto: 'EN DESTINO' },
  ENTREGADA: { bg: '#dcfce7', color: '#15803d', texto: 'ENTREGADA' },
  DEVUELTA: { bg: '#fee2e2', color: '#dc2626', texto: 'DEVUELTA' },
};

function BadgeEstado({ estado }: { estado: string }) {
  const cfg = ESTADOS[estado] || { bg: '#f1f5f9', color: '#475569', texto: estado || '—' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, background: cfg.bg, color: cfg.color }}>
      {cfg.texto}
    </span>
  );
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return '—';
  try {
    return new Date(fecha).toLocaleString('es-CO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

const formatPeso = (v: number | null) => v == null ? '—' : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

interface Campo { label: string; valor: React.ReactNode }

function Grid({ campos }: { campos: Campo[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
      {campos.map((c) => (
        <div key={c.label}>
          <span style={{ color: '#64748b' }}>{c.label}:</span>
          <p style={{ fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{c.valor ?? '—'}</p>
        </div>
      ))}
    </div>
  );
}

interface DetalleEncomiendaModalProps {
  encomienda: EncomiendaDTO | null;
  cargando: boolean;
  onClose: () => void;
}

/**
 * Modal de solo lectura con el detalle completo de una encomienda (acción "Ver").
 */
export const DetalleEncomiendaModal: React.FC<DetalleEncomiendaModalProps> = ({ encomienda, cargando, onClose }) => {
  if (!encomienda && !cargando) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'white', zIndex: 10, borderRadius: '12px 12px 0 0' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Detalle de la Encomienda</h3>
            {encomienda && <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>Referencia: {encomienda.referencia}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
          </button>
        </div>

        {cargando ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0', color: '#94a3b8', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>progress_activity</span>
            <span style={{ fontSize: '13px' }}>Cargando detalle...</span>
          </div>
        ) : encomienda ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Estado</span>
              <BadgeEstado estado={encomienda.estado} />
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>route</span>
                Ruta
              </h4>
              <Grid campos={[
                { label: 'Oficina origen', valor: encomienda.oficinaOrigenNombre },
                { label: 'Oficina destino', valor: encomienda.oficinaDestinoNombre },
              ]} />
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#166534', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                Remitente y destinatario
              </h4>
              <Grid campos={[
                { label: 'Remitente', valor: encomienda.nombreRemitente },
                { label: 'Destinatario', valor: encomienda.nombreDestinatario },
                { label: 'Documento destinatario', valor: encomienda.documentoDestinatario },
                { label: 'Teléfono destinatario', valor: encomienda.telefonoDestinatario },
                { label: 'Dirección destinatario', valor: encomienda.direccionDestinatario },
              ]} />
            </div>

            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#7e22ce', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>inventory_2</span>
                Paquete
              </h4>
              <Grid campos={[
                { label: 'Contenido', valor: encomienda.contenidoDeclarado },
                { label: 'Peso estimado', valor: encomienda.pesoEstimado != null ? `${encomienda.pesoEstimado} kg` : null },
                { label: 'Peso real', valor: encomienda.pesoReal != null ? `${encomienda.pesoReal} kg` : null },
                { label: 'Volumen real', valor: encomienda.volumenReal != null ? `${encomienda.volumenReal} m³` : null },
                { label: 'Valor declarado', valor: formatPeso(encomienda.valorDeclarado) },
                { label: 'Valor cobrado', valor: formatPeso(encomienda.valorCobrado) },
              ]} />
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#c2410c', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
                Fechas
              </h4>
              <Grid campos={[
                { label: 'Registro', valor: formatearFecha(encomienda.fechaRegistro) },
                { label: 'Despacho', valor: formatearFecha(encomienda.fechaDespacho) },
                { label: 'Recepción en destino', valor: formatearFecha(encomienda.fechaRecepcionDestino) },
                { label: 'Entrega', valor: formatearFecha(encomienda.fechaEntrega) },
              ]} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
