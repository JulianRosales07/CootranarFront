import { useState, useEffect } from 'react';
import { vehiculosApi, archivosApi } from '../../../infrastructure/services/vehiculosApi';
import DisenadorAsientos from './DisenadorAsientos';

interface ModalDetalleVehiculoProps {
  vehiculo: any;
  onCerrar: () => void;
}

const BLUE = '#0D3B8E';

/** Extrae el array de celdas desde JSON guardado en BD o desde el objeto { distribucion }. */
function parseDistribucionAsientos(raw: unknown): any[] | null {
  if (raw == null) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { distribucion?: unknown }).distribucion)) {
      const d = (parsed as { distribucion: unknown[] }).distribucion;
      return d.length > 0 ? d : null;
    }
    return null;
  } catch {
    return null;
  }
}

const formatDate = (isoStr?: string) => {
  if (!isoStr) return '—';
  return isoStr.split('T')[0];
};

export default function ModalDetalleVehiculo({ vehiculo, onCerrar }: ModalDetalleVehiculoProps) {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [polizas, setPolizas] = useState<any[]>([]);
  const [conductores, setConductores] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoArchivo, setCargandoArchivo] = useState<string | null>(null);
  const [verAsientos, setVerAsientos] = useState(false);
  const [distribucionAsientos, setDistribucionAsientos] = useState<any[] | null>(null);

  useEffect(() => {
    if (vehiculo) cargarDetalles();
  }, [vehiculo]);

  useEffect(() => {
    setVerAsientos(false);
  }, [vehiculo?.idvehiculo]);

  const cargarDetalles = async () => {
    setCargando(true);
    setDistribucionAsientos(null);
    try {
      const [docs, pols, conds] = await Promise.all([
        vehiculosApi.obtenerDocumentos(vehiculo.idvehiculo).catch(() => ({ data: { data: { documentos: [] } } })),
        vehiculosApi.obtenerPolizas(vehiculo.idvehiculo).catch(() => ({ data: { data: { polizas: [] } } })),
        vehiculosApi.obtenerConductores(vehiculo.idvehiculo).catch(() => ({ data: { data: { conductores: [] } } }))
      ]);
      setDocumentos(docs.data.data?.documentos || []);
      setPolizas(pols.data.data?.polizas || []);
      setConductores(conds.data.data?.conductores || []);

      let distRaw: unknown = vehiculo?.distribucionasientos;
      try {
        const resVeh = await vehiculosApi.obtenerPorId(String(vehiculo.idvehiculo));
        const full = resVeh?.data?.data?.vehiculo;
        if (full?.distribucionasientos != null) {
          distRaw = full.distribucionasientos;
        }
      } catch {
        /* usar distribucionasientos del listado si falla el detalle */
      }
      setDistribucionAsientos(parseDistribucionAsientos(distRaw));
    } catch (err) { 
      console.error(err); 
    } finally { 
      setCargando(false); 
    }
  };

  const handleVerArchivo = async (url: string, id: string) => {
    if (!url) return;
    setCargandoArchivo(id);
    try {
      const res = await archivosApi.obtenerUrlFirmada(url);
      if (res.data.success && res.data.data.url) {
        window.open(res.data.data.url, '_blank');
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error al obtener URL firmada:', error);
      window.open(url, '_blank');
    } finally {
      setCargandoArchivo(null);
    }
  };

  if (!vehiculo) return null;

  return (
    <div 
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={onCerrar}
    >
      <div 
        style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '1000px', width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: '#e0e7ff', borderRadius: '10px', color: '#0D3B8E' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>directions_bus</span>
            </div>
            <div>
               <span style={{ color: '#0f172a' }}>Vehículo: {vehiculo.placa}</span>
               <span style={{ color: '#64748b', fontSize: '14px', marginLeft: '8px', fontWeight: 500 }}>Móvil {vehiculo.numeromovil}</span>
            </div>
          </h3>
          <button 
            onClick={onCerrar} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', color: '#64748b', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {cargando ? (
          <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
             <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#0D3B8E', animation: 'spin 1s linear infinite' }}>autorenew</span>
             <span style={{ fontSize: '14px', color: '#64748b' }}>Cargando expediente...</span>
          </div>
        ) : (
          <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Información General */}
            <section>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748b' }}>info</span>
                Información Técnica
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                {[
                  { label: 'Placa', value: vehiculo.placa },
                  { label: 'Nº Móvil', value: vehiculo.numeromovil },
                  { label: 'Tipo Servicio', value: vehiculo.nombretiposervicio },
                  { label: 'Tipo Bus', value: vehiculo.nombretipobus },
                  { label: 'Capacidad', value: vehiculo.capacidad },
                  { label: 'Pisos', value: vehiculo.cantidadpisos },
                  { label: 'Año', value: vehiculo.anio },
                  { label: 'Color', value: vehiculo.color },
                  { label: 'Marca', value: vehiculo.marca },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{item.label}</span>
                    <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{item.value || '—'}</span>
                  </div>
                ))}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Propietario Oficial</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <span style={{ fontSize: '15px', color: '#0f172a', fontWeight: 600 }}>
                       {vehiculo.nombrepropietario ? `${vehiculo.nombrepropietario} ${vehiculo.apellidopropietario}` : '—'}
                     </span>
                     <span style={{ backgroundColor: vehiculo.activo ? '#dcfce7' : '#f1f5f9', color: vehiculo.activo ? '#166534' : '#475569', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600 }}>
                        {vehiculo.activo ? 'Operativo' : 'Inactivo'}
                     </span>
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setVerAsientos((v) => !v)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      backgroundColor: verAsientos ? '#e0e7ff' : '#f8fafc',
                      border: `1px solid ${verAsientos ? '#a5b4fc' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: verAsientos ? BLUE : '#475569',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>event_seat</span>
                    {verAsientos ? 'Ocultar distribución de asientos' : 'Visualizar asientos'}
                  </button>
                  {!distribucionAsientos?.length && (
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Sin plano guardado en sistema</span>
                  )}
                </div>

                {verAsientos && (
                  <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                    {distribucionAsientos && distribucionAsientos.length > 0 ? (
                      <div style={{ maxHeight: 'min(70vh, 720px)', overflow: 'auto', borderRadius: '12px' }}>
                        <DisenadorAsientos
                          capacidad={Number(vehiculo.capacidad) || 0}
                          valorInicial={distribucionAsientos}
                          soloLectura
                          onChange={() => {}}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '24px',
                          backgroundColor: '#f8fafc',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '12px',
                          textAlign: 'center',
                          color: '#94a3b8',
                          fontSize: '13px',
                        }}
                      >
                        No hay distribución de asientos registrada para este vehículo.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Documentos */}
            <section>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#8b5cf6' }}>description</span>
                  Documentos <span style={{ backgroundColor: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{documentos.length}</span>
                </div>
              </h4>
              {documentos.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {documentos.map(doc => (
                    <div key={doc.iddocumento} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                         <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <span className="material-symbols-outlined">draft</span>
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{doc.tipodocumento}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                               <span>Nº {doc.numerodocumento || 'N/A'}</span>
                               <span style={{ color: '#cbd5e1' }}>•</span>
                               <span>Vence: <strong style={{ color: '#475569' }}>{formatDate(doc.fechavencimiento)}</strong></span>
                            </div>
                         </div>
                      </div>
                      {doc.archivourl && (
                        <button 
                          onClick={() => handleVerArchivo(doc.archivourl, doc.iddocumento)} 
                          disabled={cargandoArchivo === doc.iddocumento}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#0D3B8E', cursor: 'pointer', transition: 'all 0.2s', opacity: cargandoArchivo === doc.iddocumento ? 0.7 : 1 }}
                        >
                          {cargandoArchivo === doc.iddocumento ? 'Cargando...' : 'Ver Archivo'}
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{cargandoArchivo === doc.iddocumento ? 'progress_activity' : 'open_in_new'}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : <div style={{ padding: '24px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No hay documentos requeridos cargados.</div>}
            </section>

            {/* Pólizas */}
            <section>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#f59e0b' }}>shield</span>
                  Pólizas de Seguro <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{polizas.length}</span>
                </div>
              </h4>
              {polizas.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {polizas.map(pol => (
                    <div key={pol.idpoliza} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                         <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                            <span className="material-symbols-outlined">verified</span>
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{pol.tipopoliza}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                               <span>Código: {pol.codigopoliza || 'N/A'}</span>
                               <span style={{ color: '#cbd5e1' }}>•</span>
                               <span>Aseguradora: <strong style={{ color: '#475569' }}>{pol.nombreaseguradora || 'N/A'}</strong></span>
                               <span style={{ color: '#cbd5e1' }}>•</span>
                               <span>Vence: <strong style={{ color: '#475569' }}>{formatDate(pol.fechavencimiento)}</strong></span>
                            </div>
                         </div>
                      </div>
                      {pol.archivourl && (
                        <button 
                          onClick={() => handleVerArchivo(pol.archivourl, pol.idpoliza)}
                          disabled={cargandoArchivo === pol.idpoliza}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#0D3B8E', cursor: 'pointer', transition: 'all 0.2s', opacity: cargandoArchivo === pol.idpoliza ? 0.7 : 1 }}
                        >
                          {cargandoArchivo === pol.idpoliza ? 'Cargando...' : 'Certificado'}
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{cargandoArchivo === pol.idpoliza ? 'progress_activity' : 'open_in_new'}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : <div style={{ padding: '24px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No hay pólizas registradas vigentes.</div>}
            </section>

            {/* Conductores */}
            <section>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#10b981' }}>id_card</span>
                  Conductores Principales <span style={{ backgroundColor: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{conductores.filter(c => !c.esremplazo).length}</span>
                </div>
              </h4>
              {conductores.filter(c => !c.esremplazo).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {conductores.filter(c => !c.esremplazo).map((c, i) => (
                    <div key={c.idusuario || i} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ffffff', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 2px rgba(16, 185, 129, 0.05)' }}>
                       <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>account_circle</span>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#064e3b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{c.nombre} {c.apellido}</span>
                          <span style={{ fontSize: '12px', color: '#059669' }}>C.C. {c.documento}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Lic: {c.numerolicencia}</span>
                              <span style={{ fontSize: '11px', backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Cat: {c.categorialicencia}</span>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ padding: '24px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No hay conductores principales asignados.</div>}
            </section>

            {/* Conductores de Reemplazo */}
            {conductores.filter(c => c.esremplazo).length > 0 && (
              <section>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#3b82f6' }}>swap_horiz</span>
                    Conductores de Reemplazo <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{conductores.filter(c => c.esremplazo).length}</span>
                  </div>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {conductores.filter(c => c.esremplazo).map((c, i) => (
                    <div key={c.idusuario || i} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 2px rgba(59, 130, 246, 0.05)' }}>
                       <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>account_circle</span>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{c.nombre} {c.apellido}</span>
                          <span style={{ fontSize: '12px', color: '#2563eb' }}>C.C. {c.documento}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Lic: {c.numerolicencia}</span>
                              <span style={{ fontSize: '11px', backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Cat: {c.categorialicencia}</span>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}