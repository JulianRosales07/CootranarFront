import React, { useState, useEffect } from 'react';

interface PuntoRuta {
  idpuntoruta: number;
  nombre: string;
  idagencia: number | null;
  orden: number;
}

interface TipoBus {
  idtipobus: number;
  nombre: string;
  cantidadpisos: number;
}

interface TarifaData {
  idpuntoorigen: string;
  idpuntodestino: string;
  idtipobus: string;
  piso: number;
  valornormal: string;
  valortraficoalto: string;
  adicionalpoltrona: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  puntos: PuntoRuta[];
  tiposBus: TipoBus[];
  editando: any | null;
  loading: boolean;
}

const fmtPeso = (v: number | string) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(v));

const MODAL_VACIO: TarifaData = {
  idpuntoorigen: '',
  idpuntodestino: '',
  idtipobus: '',
  piso: 1,
  valornormal: '',
  valortraficoalto: '',
  adicionalpoltrona: '0',
};

export const ModalTarifa: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  puntos,
  tiposBus,
  editando,
  loading,
}) => {
  const [formData, setFormData] = useState<TarifaData>(MODAL_VACIO);

  useEffect(() => {
    if (editando) {
      setFormData({
        idpuntoorigen: String(editando.idpuntoorigen || ''),
        idpuntodestino: String(editando.idpuntodestino || ''),
        idtipobus: String(editando.idtipobus || ''),
        piso: Number(editando.piso || 1),
        valornormal: String(editando.valornormal || ''),
        valortraficoalto: String(editando.valortraficoalto || ''),
        adicionalpoltrona: String(editando.adicionalpoltrona || '0'),
      });
    } else {
      setFormData(MODAL_VACIO);
    }
  }, [editando, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.idpuntoorigen) {
      alert('Selecciona el punto origen');
      return;
    }
    if (!formData.idpuntodestino) {
      alert('Selecciona el punto destino');
      return;
    }
    if (!formData.idtipobus) {
      alert('Selecciona el tipo de bus');
      return;
    }
    if (!formData.valornormal || !formData.valortraficoalto) {
      alert('Ingresa los valores de tarifa');
      return;
    }

    await onSave({
      idpuntoorigen: parseInt(formData.idpuntoorigen),
      idpuntodestino: parseInt(formData.idpuntodestino),
      idtipobus: parseInt(formData.idtipobus),
      piso: formData.piso,
      valornormal: parseFloat(formData.valornormal),
      valortraficoalto: parseFloat(formData.valortraficoalto),
      adicionalpoltrona: parseFloat(formData.adicionalpoltrona) || 0,
    });
  };

  const puntosConAgencia = puntos.filter(p => p.idagencia);
  const ultimoOrden = puntos.length > 0 ? Math.max(...puntos.map(p => p.orden)) : 0;
  const origenesValidos = puntosConAgencia.filter(p => p.orden < ultimoOrden);

  const destinosParaOrigen = (idOrigen: string) => {
    const origen = puntos.find(p => p.idpuntoruta === parseInt(idOrigen));
    if (!origen) return [];
    return puntos.filter(p => p.orden > origen.orden);
  };

  const tipoBusSeleccionado = tiposBus.find(tb => tb.idtipobus === parseInt(formData.idtipobus));
  const maxPisos = tipoBusSeleccionado?.cantidadpisos || 1;

  const nombrePunto = (id: string) => puntos.find(p => p.idpuntoruta === parseInt(id))?.nombre || '—';

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#334155',
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            {editando ? 'Editar tarifa' : 'Agregar tarifa'}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Preview tramo */}
            {formData.idpuntoorigen && formData.idpuntodestino && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#166534', fontWeight: 600 }}>
                {nombrePunto(formData.idpuntoorigen)} → {nombrePunto(formData.idpuntodestino)}
              </div>
            )}

            {/* Origen */}
            {!editando && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                    Punto origen <span style={{ color: '#22c55e' }}>★</span> <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={formData.idpuntoorigen}
                    onChange={(e) => setFormData({ ...formData, idpuntoorigen: e.target.value, idpuntodestino: '' })}
                    style={inputStyle}
                  >
                    <option value="">Seleccionar origen...</option>
                    {origenesValidos.map(p => (
                      <option key={p.idpuntoruta} value={p.idpuntoruta}>{p.nombre} ★</option>
                    ))}
                  </select>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', margin: 0 }}>
                    Solo puntos con agencia pueden originar ventas
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                    Punto destino <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={formData.idpuntodestino}
                    onChange={(e) => setFormData({ ...formData, idpuntodestino: e.target.value })}
                    style={inputStyle}
                    disabled={!formData.idpuntoorigen}
                  >
                    <option value="">Seleccionar destino...</option>
                    {destinosParaOrigen(formData.idpuntoorigen).map(p => (
                      <option key={p.idpuntoruta} value={p.idpuntoruta}>
                        {p.nombre}{p.idagencia ? ' ★' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                    Tipo de bus <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={formData.idtipobus}
                    onChange={(e) => setFormData({ ...formData, idtipobus: e.target.value, piso: 1 })}
                    style={inputStyle}
                  >
                    <option value="">Seleccionar...</option>
                    {tiposBus.map(tb => (
                      <option key={tb.idtipobus} value={tb.idtipobus}>{tb.nombre}</option>
                    ))}
                  </select>
                </div>

                {formData.idtipobus && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                      Piso
                    </label>
                    {maxPisos === 1 ? (
                      <input
                        type="number"
                        value="1"
                        disabled
                        style={{ ...inputStyle, background: '#f8fafc' }}
                      />
                    ) : (
                      <select
                        value={formData.piso}
                        onChange={(e) => setFormData({ ...formData, piso: parseInt(e.target.value) })}
                        style={inputStyle}
                      >
                        {Array.from({ length: maxPisos }, (_, i) => i + 1).map(p => (
                          <option key={p} value={p}>Piso {p}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Valores */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                  Valor normal <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.valornormal}
                  onChange={(e) => setFormData({ ...formData, valornormal: e.target.value })}
                  style={inputStyle}
                  placeholder="65000"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                  Tráfico alto <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.valortraficoalto}
                  onChange={(e) => setFormData({ ...formData, valortraficoalto: e.target.value })}
                  style={inputStyle}
                  placeholder="80000"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                  + Poltrona
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.adicionalpoltrona}
                  onChange={(e) => setFormData({ ...formData, adicionalpoltrona: e.target.value })}
                  style={inputStyle}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Preview precios */}
            {formData.valornormal && formData.valortraficoalto && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', fontSize: '11px', color: '#166534' }}>
                Normal: <strong>{fmtPeso(formData.valornormal)}</strong>
                {' · '}Alto: <strong>{fmtPeso(formData.valortraficoalto)}</strong>
                {parseFloat(formData.adicionalpoltrona) > 0 && (
                  <> · Poltrona: <strong>{fmtPeso(formData.adicionalpoltrona)}</strong></>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '13px', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#0D3B8E', color: 'white', fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 600, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Guardando...' : (editando ? 'Guardar cambios' : 'Agregar tarifa')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
