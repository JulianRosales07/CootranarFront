import React, { useEffect, useState } from 'react';
import { cotizarEncomienda } from '../../hooks/useEncomiendas';
import { useOficinasEncomiendas } from '../../hooks/useOficinasEncomiendas';
import metodosPagoApiService from '../../../infrastructure/services/metodosPagoApi';
import type { EncomiendaDTO } from '../../../application/dto/EncomiendaDTO';

const BLUE = '#0D3B8E';

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px',
  border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '13px',
  color: '#334155', outline: 'none', background: 'white', fontFamily: 'inherit',
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const formatPeso = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

interface MetodoPago { idmetodopago: number; nombre: string }

interface RegistroEncomiendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Si viene de una preinscripción encontrada por referencia/QR, se pre-llena. */
  preinscripcion: EncomiendaDTO | null;
  idOficinaOrigen: string;
  cargando: boolean;
  onRegistrarConPreinscripcion: (data: Record<string, unknown>) => void;
  onRegistrarDirecta: (data: Record<string, unknown>) => void;
}

/**
 * Modal de registro oficial de encomienda. Soporta dos modos:
 * - Con preinscripción (datos de remitente/destinatario ya cargados desde e-commerce)
 * - Registro directo (formulario vacío, cliente sin preinscripción)
 */
export const RegistroEncomiendaModal: React.FC<RegistroEncomiendaModalProps> = ({
  isOpen,
  onClose,
  preinscripcion,
  idOficinaOrigen,
  cargando,
  onRegistrarConPreinscripcion,
  onRegistrarDirecta,
}) => {
  const { oficinas } = useOficinasEncomiendas();
  const oficinasList = Array.isArray(oficinas) ? oficinas.filter((o: any) => o.activo) : [];
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);

  const esConPreinscripcion = !!preinscripcion;

  // Remitente / destinatario (solo editable en registro directo)
  const [nombreRemitente, setNombreRemitente] = useState('');
  const [documentoRemitente, setDocumentoRemitente] = useState('');
  const [telefonoRemitente, setTelefonoRemitente] = useState('');
  const [nombreDestinatario, setNombreDestinatario] = useState('');
  const [documentoDestinatario, setDocumentoDestinatario] = useState('');
  const [telefonoDestinatario, setTelefonoDestinatario] = useState('');
  const [direccionDestinatario, setDireccionDestinatario] = useState('');
  const [contenidoDeclarado, setContenidoDeclarado] = useState('');
  const [idOficinaDestino, setIdOficinaDestino] = useState('');
  const [valorDeclarado, setValorDeclarado] = useState('');

  // Campos comunes (siempre editables)
  const [pesoReal, setPesoReal] = useState('');
  const [volumenReal, setVolumenReal] = useState('');
  const [idMetodoPago, setIdMetodoPago] = useState('');
  const [formaPago, setFormaPago] = useState<'CONTADO' | 'CREDITO'>('CONTADO');
  const [numeroCuotas, setNumeroCuotas] = useState('1');
  const [esDomicilio, setEsDomicilio] = useState(false);
  const [valorDomicilio, setValorDomicilio] = useState('');

  const [precioEstimado, setPrecioEstimado] = useState<number | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    metodosPagoApiService.obtenerActivos()
      .then(res => setMetodosPago(res.data?.data?.metodosPago || res.data?.data || []))
      .catch(() => setMetodosPago([]));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (preinscripcion) {
      setNombreRemitente(preinscripcion.nombreRemitente || '');
      setNombreDestinatario(preinscripcion.nombreDestinatario || '');
      setDocumentoDestinatario(preinscripcion.documentoDestinatario || '');
      setTelefonoDestinatario(preinscripcion.telefonoDestinatario || '');
      setDireccionDestinatario(preinscripcion.direccionDestinatario || '');
      setContenidoDeclarado(preinscripcion.contenidoDeclarado || '');
      setIdOficinaDestino(preinscripcion.idOficinaDestino || '');
      setValorDeclarado(preinscripcion.valorDeclarado ? String(preinscripcion.valorDeclarado) : '');
      setPesoReal(preinscripcion.pesoEstimado != null ? String(preinscripcion.pesoEstimado) : '');
      setEsDomicilio(preinscripcion.esDomicilio || false);
      setValorDomicilio(preinscripcion.valorDomicilio ? String(preinscripcion.valorDomicilio) : '');
    } else {
      setNombreRemitente(''); setDocumentoRemitente(''); setTelefonoRemitente('');
      setNombreDestinatario(''); setDocumentoDestinatario(''); setTelefonoDestinatario('');
      setDireccionDestinatario(''); setContenidoDeclarado(''); setIdOficinaDestino('');
      setValorDeclarado(''); setPesoReal(''); setEsDomicilio(false); setValorDomicilio('');
    }
    setVolumenReal(''); setIdMetodoPago(''); setFormaPago('CONTADO'); setNumeroCuotas('1');
    setPrecioEstimado(null); setError(null);
  }, [isOpen, preinscripcion]);

  // Cálculo de precio en tiempo real
  useEffect(() => {
    const destino = idOficinaDestino;
    const origen = esConPreinscripcion ? preinscripcion!.idOficinaOrigen : idOficinaOrigen;
    if (!destino || !origen || !pesoReal || Number(pesoReal) <= 0) {
      setPrecioEstimado(null);
      return;
    }
    const timeout = setTimeout(() => {
      setCalculando(true);
      cotizarEncomienda({
        idOficinaOrigen: origen,
        idOficinaDestino: destino,
        pesoEstimado: pesoReal,
        volumenEstimado: volumenReal || '1',
        valorDeclarado: valorDeclarado || '0',
        esDomicilio,
        valorDomicilio: valorDomicilio || '0',
      })
        .then(setPrecioEstimado)
        .catch(() => setPrecioEstimado(null))
        .finally(() => setCalculando(false));
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idOficinaDestino, idOficinaOrigen, pesoReal, volumenReal, valorDeclarado, esDomicilio, valorDomicilio]);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pesoReal || Number(pesoReal) <= 0) { setError('El peso real es obligatorio y debe ser mayor a 0.'); return; }
    if (!volumenReal || Number(volumenReal) <= 0) { setError('El volumen real es obligatorio y debe ser mayor a 0.'); return; }
    if (!idMetodoPago) { setError('Selecciona un método de pago.'); return; }
    if (esDomicilio && (!valorDomicilio || Number(valorDomicilio) < 0)) { setError('Ingresa el valor del domicilio.'); return; }

    if (esConPreinscripcion) {
      onRegistrarConPreinscripcion({
        referenciaEncomienda: preinscripcion!.referencia,
        pesoReal: Number(pesoReal),
        volumenReal: Number(volumenReal),
        idMetodoPago: Number(idMetodoPago),
        formaPago,
        numeroCuotas: formaPago === 'CREDITO' ? Number(numeroCuotas) : 1,
        esDomicilio,
        valorDomicilio: esDomicilio ? Number(valorDomicilio) : 0,
      });
    } else {
      if (!nombreRemitente || !documentoRemitente || !telefonoRemitente) { setError('Los datos del remitente son obligatorios.'); return; }
      if (!nombreDestinatario || !documentoDestinatario || !telefonoDestinatario) { setError('Los datos del destinatario son obligatorios.'); return; }
      if (!contenidoDeclarado) { setError('La descripción del contenido es obligatoria.'); return; }
      if (!idOficinaDestino) { setError('Selecciona la oficina de destino.'); return; }
      if (idOficinaDestino === idOficinaOrigen) { setError('La oficina destino debe ser diferente a tu oficina.'); return; }

      onRegistrarDirecta({
        nombreRemitente, documentoRemitente, telefonoRemitente,
        nombreDestinatario, documentoDestinatario, telefonoDestinatario,
        direccionDestinatario: direccionDestinatario || undefined,
        contenidoDeclarado,
        idOficinaDestino: Number(idOficinaDestino),
        pesoReal: Number(pesoReal),
        volumenReal: Number(volumenReal),
        valorDeclarado: Number(valorDeclarado) || 0,
        idMetodoPago: Number(idMetodoPago),
        formaPago,
        numeroCuotas: formaPago === 'CREDITO' ? Number(numeroCuotas) : 1,
        esDomicilio,
        valorDomicilio: esDomicilio ? Number(valorDomicilio) : 0,
      });
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'white', zIndex: 10, borderRadius: '12px 12px 0 0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {esConPreinscripcion ? 'Registrar Encomienda (Preinscripción)' : 'Registrar Encomienda Directa'}
          </h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!esConPreinscripcion && (
            <>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Remitente</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <Field label="Nombre" required>
                  <input value={nombreRemitente} onChange={e => setNombreRemitente(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Documento" required>
                  <input value={documentoRemitente} onChange={e => setDocumentoRemitente(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Teléfono" required>
                  <input value={telefonoRemitente} onChange={e => setTelefonoRemitente(e.target.value)} style={inputStyle} />
                </Field>
              </div>

              <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Destinatario</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <Field label="Nombre" required>
                  <input value={nombreDestinatario} onChange={e => setNombreDestinatario(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Documento" required>
                  <input value={documentoDestinatario} onChange={e => setDocumentoDestinatario(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Teléfono" required>
                  <input value={telefonoDestinatario} onChange={e => setTelefonoDestinatario(e.target.value)} style={inputStyle} />
                </Field>
              </div>
              <Field label="Dirección destinatario">
                <input value={direccionDestinatario} onChange={e => setDireccionDestinatario(e.target.value)} style={inputStyle} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Oficina de destino" required>
                  <select value={idOficinaDestino} onChange={e => setIdOficinaDestino(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                    <option value="">Seleccionar oficina...</option>
                    {oficinasList.filter((o: any) => o.id !== idOficinaOrigen).map((o: any) => (
                      <option key={o.id} value={o.id}>{o.nombre || o.direccion} - {o.ciudadNombre}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Valor declarado">
                  <input type="number" min="0" value={valorDeclarado} onChange={e => setValorDeclarado(e.target.value)} placeholder="0" style={inputStyle} />
                </Field>
              </div>

              <Field label="Descripción del contenido" required>
                <input value={contenidoDeclarado} onChange={e => setContenidoDeclarado(e.target.value)} placeholder="Ej. Caja de documentos" style={inputStyle} />
              </Field>
            </>
          )}

          {esConPreinscripcion && preinscripcion && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', fontSize: '12.5px', color: '#475569' }}>
              <div><strong>Remitente:</strong> {preinscripcion.nombreRemitente || 'N/A'}</div>
              <div><strong>Destinatario:</strong> {preinscripcion.nombreDestinatario} ({preinscripcion.documentoDestinatario})</div>
              <div><strong>Ruta:</strong> {preinscripcion.oficinaOrigenNombre} → {preinscripcion.oficinaDestinoNombre}</div>
              <div><strong>Contenido:</strong> {preinscripcion.contenidoDeclarado}</div>
            </div>
          )}

          <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Datos físicos y pago</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Peso real (kg)" required>
              <input type="number" min="0" step="0.1" value={pesoReal} onChange={e => setPesoReal(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Volumen real (m³)" required>
              <input type="number" min="0" step="0.01" value={volumenReal} onChange={e => setVolumenReal(e.target.value)} style={inputStyle} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Método de pago" required>
              <select value={idMetodoPago} onChange={e => setIdMetodoPago(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                <option value="">Seleccionar...</option>
                {metodosPago.map(m => <option key={m.idmetodopago} value={m.idmetodopago}>{m.nombre}</option>)}
              </select>
            </Field>
            <Field label="Forma de pago" required>
              <select value={formaPago} onChange={e => setFormaPago(e.target.value as 'CONTADO' | 'CREDITO')} style={{ ...inputStyle, appearance: 'none' }}>
                <option value="CONTADO">Contado</option>
                <option value="CREDITO">Crédito</option>
              </select>
            </Field>
          </div>

          {formaPago === 'CREDITO' && (
            <Field label="Número de cuotas" required>
              <input type="number" min="1" max="36" value={numeroCuotas} onChange={e => setNumeroCuotas(e.target.value)} style={inputStyle} />
            </Field>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id="esDomicilio" checked={esDomicilio} onChange={e => setEsDomicilio(e.target.checked)} />
            <label htmlFor="esDomicilio" style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>Requiere domicilio</label>
          </div>
          {esDomicilio && (
            <Field label="Valor del domicilio" required>
              <input type="number" min="0" value={valorDomicilio} onChange={e => setValorDomicilio(e.target.value)} style={inputStyle} />
            </Field>
          )}

          <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>Precio estimado:</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>
              {calculando ? 'Calculando...' : precioEstimado != null ? formatPeso(precioEstimado) : '—'}
            </span>
          </div>

          {error && <p style={{ fontSize: '12.5px', color: '#dc2626', fontWeight: 600, margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
            <button type="button" onClick={handleClose} style={{ background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '7px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button type="submit" disabled={cargando} style={{ background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: cargando ? 'default' : 'pointer', fontFamily: 'inherit', opacity: cargando ? 0.7 : 1 }}>
              {cargando ? 'Registrando...' : 'Registrar Encomienda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
