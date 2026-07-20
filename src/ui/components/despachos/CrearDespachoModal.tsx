import React, { useEffect, useState } from 'react';
import { useOficinasEncomiendas } from '../../hooks/useOficinasEncomiendas';
import { conductoresApi } from '../../../infrastructure/services/conductoresApi';
import { ModalSeleccionarFurgon } from './ModalSeleccionarFurgon';
import { ModalSeleccionarConductorDespacho } from './ModalSeleccionarConductorDespacho';
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

interface Vehiculo {
  idvehiculo: number;
  placa: string;
  numeromovil: string;
  idconductor1?: number | null;
  nombreconductor1?: string | null;
  apellidoconductor1?: string | null;
  documentoconductor1?: string | null;
}
interface Conductor { idusuario: number; nombre: string; apellido: string; documento: string }

interface CrearDespachoModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Encomiendas en estado REGISTRADA disponibles en la oficina del empleado. */
  encomiendasDisponibles: EncomiendaDTO[];
  idOficinaOrigen: string;
  cargando: boolean;
  onCrear: (data: { idOficinaDestino: string; idVehiculo: string; idConductor: string; idsEncomienda: string[]; fechaProgramada?: string }) => void;
}

/**
 * Formulario para crear un despacho: selección múltiple de encomiendas
 * REGISTRADA (mismo destino), vehículo, conductor, oficina destino y
 * fecha/hora programada.
 */
export const CrearDespachoModal: React.FC<CrearDespachoModalProps> = ({
  isOpen,
  onClose,
  encomiendasDisponibles,
  idOficinaOrigen,
  cargando,
  onCrear,
}) => {
  const { oficinas } = useOficinasEncomiendas();
  const oficinasList = Array.isArray(oficinas) ? oficinas.filter((o: any) => o.activo && o.id !== idOficinaOrigen) : [];

  const [idOficinaDestino, setIdOficinaDestino] = useState('');
  const [furgonSeleccionado, setFurgonSeleccionado] = useState<Vehiculo | null>(null);
  const [conductorSeleccionado, setConductorSeleccionado] = useState<Conductor | null>(null);
  const [conductorAutocompletado, setConductorAutocompletado] = useState(false);
  const [fechaProgramada, setFechaProgramada] = useState('');
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [mostrarModalFurgon, setMostrarModalFurgon] = useState(false);
  const [mostrarModalConductor, setMostrarModalConductor] = useState(false);

  const idVehiculo = furgonSeleccionado ? String(furgonSeleccionado.idvehiculo) : '';
  const idConductor = conductorSeleccionado ? String(conductorSeleccionado.idusuario) : '';

  useEffect(() => {
    if (!isOpen) {
      setIdOficinaDestino(''); setFurgonSeleccionado(null); setConductorSeleccionado(null);
      setConductorAutocompletado(false);
      setFechaProgramada(''); setSeleccionadas(new Set()); setError(null);
    }
  }, [isOpen]);

  const handleSeleccionarFurgon = async (v: Vehiculo) => {
    setFurgonSeleccionado(v);
    setMostrarModalFurgon(false);
    // Autocompletar con el conductor principal del furgón, si tiene uno asignado.
    // El usuario puede cambiarlo después si lo desea.
    if (v.idconductor1) {
      try {
        const res = await conductoresApi.obtenerActivos();
        const data = res.data?.data;
        const lista: Conductor[] = data?.conductores || data || [];
        const conductorPrincipal = lista.find(c => c.idusuario === v.idconductor1);
        if (conductorPrincipal) {
          setConductorSeleccionado(conductorPrincipal);
        } else {
          // El listado de activos no lo trajo (p.ej. quedó inactivo); usamos los
          // datos ya disponibles del propio furgón para no dejar el campo vacío.
          setConductorSeleccionado({
            idusuario: v.idconductor1,
            nombre: v.nombreconductor1 || '',
            apellido: v.apellidoconductor1 || '',
            documento: v.documentoconductor1 || '',
          });
        }
        setConductorAutocompletado(true);
      } catch {
        setConductorSeleccionado(null);
        setConductorAutocompletado(false);
      }
    } else {
      setConductorSeleccionado(null);
      setConductorAutocompletado(false);
    }
  };

  const handleSeleccionarConductor = (c: Conductor) => {
    setConductorSeleccionado(c);
    setConductorAutocompletado(false);
    setMostrarModalConductor(false);
  };

  if (!isOpen) return null;

  // Solo se pueden despachar encomiendas REGISTRADA que compartan la
  // oficina destino seleccionada.
  const encomiendasElegibles = encomiendasDisponibles.filter(
    (e) => e.estado === 'REGISTRADA' && (!idOficinaDestino || e.idOficinaDestino === idOficinaDestino)
  );

  const toggleSeleccion = (id: string) => {
    setSeleccionadas(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!idOficinaDestino) { setError('Selecciona la oficina de destino.'); return; }
    if (!idVehiculo) { setError('Selecciona el vehículo asignado.'); return; }
    if (!idConductor) { setError('Selecciona el conductor encargado.'); return; }
    if (seleccionadas.size === 0) { setError('Selecciona al menos una encomienda para el despacho.'); return; }

    onCrear({
      idOficinaDestino,
      idVehiculo,
      idConductor,
      idsEncomienda: Array.from(seleccionadas),
      fechaProgramada: fechaProgramada || undefined,
    });
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'white', zIndex: 10, borderRadius: '12px 12px 0 0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Crear Despacho</h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Oficina destino" required>
              <select value={idOficinaDestino} onChange={e => { setIdOficinaDestino(e.target.value); setSeleccionadas(new Set()); }} style={{ ...inputStyle, appearance: 'none' }}>
                <option value="">Seleccionar oficina...</option>
                {oficinasList.map((o: any) => (
                  <option key={o.id} value={o.id}>{o.nombre || o.direccion} - {o.ciudadNombre}</option>
                ))}
              </select>
            </Field>
            <Field label="Fecha y hora programada">
              <input type="datetime-local" value={fechaProgramada} onChange={e => setFechaProgramada(e.target.value)} style={inputStyle} />
            </Field>
          </div>

          <Field label="Furgón asignado" required>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={furgonSeleccionado ? `${furgonSeleccionado.placa} - Móvil #${furgonSeleccionado.numeromovil}` : ''}
                readOnly
                placeholder="Seleccione un furgón"
                style={{ ...inputStyle, flex: 1, background: '#f8fafc' }}
              />
              <button
                type="button"
                onClick={() => setMostrarModalFurgon(true)}
                style={{ padding: '9px 16px', background: BLUE, color: 'white', borderRadius: '7px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Seleccionar
              </button>
            </div>
            {furgonSeleccionado && (
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '6px 0 0' }}>
                Conductor principal: {furgonSeleccionado.nombreconductor1
                  ? `${furgonSeleccionado.nombreconductor1} ${furgonSeleccionado.apellidoconductor1 ?? ''}`
                  : 'Sin conductor asignado'}
              </p>
            )}
          </Field>

          <Field label="Conductor encargado" required>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={conductorSeleccionado ? `${conductorSeleccionado.nombre} ${conductorSeleccionado.apellido} - ${conductorSeleccionado.documento}` : ''}
                readOnly
                placeholder="Seleccione un conductor"
                style={{ ...inputStyle, flex: 1, background: '#f8fafc' }}
              />
              <button
                type="button"
                onClick={() => setMostrarModalConductor(true)}
                style={{ padding: '9px 16px', background: BLUE, color: 'white', borderRadius: '7px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Seleccionar
              </button>
            </div>
            {conductorAutocompletado && (
              <p style={{ fontSize: '11.5px', color: '#0D3B8E', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Autocompletado con el conductor principal del furgón. Puedes cambiarlo si lo deseas.
              </p>
            )}
          </Field>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
              Encomiendas a despachar {idOficinaDestino ? '(REGISTRADA hacia la oficina seleccionada)' : '(elige primero la oficina destino)'}
            </p>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {encomiendasElegibles.length === 0 ? (
                <p style={{ padding: '18px', textAlign: 'center', fontSize: '12.5px', color: '#94a3b8', margin: 0 }}>
                  No hay encomiendas disponibles para despachar a esta oficina.
                </p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {encomiendasElegibles.map(enc => (
                      <tr key={enc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', width: '32px' }}>
                          <input type="checkbox" checked={seleccionadas.has(enc.id)} onChange={() => toggleSeleccion(enc.id)} />
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: '12px', fontFamily: 'monospace', color: '#334155' }}>{enc.referencia}</td>
                        <td style={{ padding: '8px 12px', fontSize: '12.5px', color: '#1e293b' }}>{enc.nombreDestinatario}</td>
                        <td style={{ padding: '8px 12px', fontSize: '12px', color: '#64748b' }}>{enc.pesoReal ?? enc.pesoEstimado ?? '-'} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <p style={{ fontSize: '11.5px', color: '#64748b', margin: '8px 0 0' }}>{seleccionadas.size} encomienda(s) seleccionada(s)</p>
          </div>

          {error && <p style={{ fontSize: '12.5px', color: '#dc2626', fontWeight: 600, margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
            <button type="button" onClick={handleClose} style={{ background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '7px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button type="submit" disabled={cargando} style={{ background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: cargando ? 'default' : 'pointer', fontFamily: 'inherit', opacity: cargando ? 0.7 : 1 }}>
              {cargando ? 'Creando...' : 'Crear Despacho'}
            </button>
          </div>
        </form>
      </div>

      <ModalSeleccionarFurgon
        isOpen={mostrarModalFurgon}
        onClose={() => setMostrarModalFurgon(false)}
        onSelect={handleSeleccionarFurgon}
      />

      <ModalSeleccionarConductorDespacho
        isOpen={mostrarModalConductor}
        onClose={() => setMostrarModalConductor(false)}
        onSelect={handleSeleccionarConductor}
        idSeleccionado={idConductor}
      />
    </div>
  );
};
