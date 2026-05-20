import { useState, useEffect } from 'react';
import { vehiculosApi, propietariosApi, tiposBusApi, tiposServicioApi, aseguradorasApi, archivosApi } from '../../../infrastructure/services/vehiculosApi';
import { conductoresApi } from '../../../infrastructure/services/conductoresApi';
import DisenadorAsientos from './DisenadorAsientos';

const PASOS = ['Propietario', 'Vehículo', 'Asientos', 'Documentos', 'Pólizas', 'Conductores'];

const abrirArchivo = async (url: string) => {
  if (!url) return;
  try {
    const res = await archivosApi.obtenerUrlFirmada(url);
    const firmada = res.data?.data?.url || res.data?.url;
    window.open(firmada, '_blank');
  } catch {
    alert('No se pudo obtener el enlace del archivo');
  }
};

export default function ModalEditarVehiculo({ vehiculo, onCerrar, onActualizado }: any) {
  const [pasoActual, setPasoActual] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Catálogos
  const [tiposBus, setTiposBus] = useState([]);
  const [tiposServicio, setTiposServicio] = useState([]);
  const [aseguradoras, setAseguradoras] = useState([]);

  // Propietario
  const [propietario, setPropietario] = useState<any>(null);
  const [docPropietario, setDocPropietario] = useState('');
  const [buscandoProp, setBuscandoProp] = useState(false);
  const [modoProp, setModoProp] = useState('encontrado');
  const [nuevoProp, setNuevoProp] = useState({ nombre: '', apellido: '', telefono: '', correo: '' });

  // Formulario vehículo
  const [form, setForm] = useState({
    placa: '', numeromovil: '', idtiposervicio: '', idtipobus: '',
    modelo: '', capacidad: '', cantidadpisos: '', anio: '',
    color: '', chasis: '', motor: '',
  });

  // Asientos
  const [distribucion, setDistribucion] = useState<any>(null);

  // Documentos
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [archivosDoc, setArchivosDoc] = useState<any>({});

  // Pólizas
  const [polizas, setPolizas] = useState<any[]>([]);
  const [archivosPoliza, setArchivosPoliza] = useState<any>({});

  // Conductores
  const [conductores, setConductores] = useState<any[]>([]);
  const [docConductor, setDocConductor] = useState('');
  const [buscandoCond, setBuscandoCond] = useState(false);
  const [mostrarFormCond, setMostrarFormCond] = useState(false);
  const [nuevoCond, setNuevoCond] = useState({
    nombre: '', apellido: '', telefono: '', correo: '',
    numerolicencia: '', categoriaslicencia: '', fechavencimientolicencia: '',
  });
  const [archivoLicenciaNuevo, setArchivoLicenciaNuevo] = useState<any>(null);
  const [conductoresDesasignar, setConductoresDesasignar] = useState<number[]>([]);

  useEffect(() => {
    if (!vehiculo) return;
    setPasoActual(0);
    setError('');
    setForm({
      placa: vehiculo.placa || '',
      numeromovil: vehiculo.numeromovil || '',
      idtiposervicio: vehiculo.idtiposervicio || '',
      idtipobus: vehiculo.idtipobus || '',
      modelo: vehiculo.modelo || '',
      capacidad: vehiculo.capacidad || '',
      cantidadpisos: vehiculo.cantidadpisos || '',
      anio: vehiculo.anio || '',
      color: vehiculo.color || '',
      chasis: vehiculo.chasis || '',
      motor: vehiculo.motor || '',
    });

    setPropietario({
      idusuario: vehiculo.idusuariopropietario,
      nombre: vehiculo.nombrepropietario,
      apellido: vehiculo.apellidopropietario,
      documento: vehiculo.documentopropietario,
    });
    setModoProp('encontrado');
    setDocPropietario('');
    setNuevoProp({ nombre: '', apellido: '', telefono: '', correo: '' });

    try {
      const raw = vehiculo.distribucionasientos;
      setDistribucion(typeof raw === 'string' ? JSON.parse(raw) : raw || null);
    } catch {
      setDistribucion(null);
    }

    Promise.all([
      tiposBusApi.obtenerActivos(),
      tiposServicioApi.obtenerActivos(),
      aseguradorasApi.obtenerActivas(),
      vehiculosApi.obtenerDocumentos(vehiculo.idvehiculo),
      vehiculosApi.obtenerPolizas(vehiculo.idvehiculo),
      vehiculosApi.obtenerConductores(vehiculo.idvehiculo),
    ]).then(([tb, ts, as, docs, pols, conds]) => {
      setTiposBus(tb.data?.data?.tiposBus || tb.data?.data?.tiposbus || []);
      setTiposServicio(ts.data?.data?.tiposServicio || ts.data?.data?.tiposservicio || []);
      setAseguradoras(as.data?.data?.aseguradoras || []);
      setDocumentos((docs.data?.data?.documentos || []).map((d: any) => ({
        ...d,
        fechavencimiento: d.fechavencimiento ? d.fechavencimiento.split('T')[0] : '',
        _modificado: false,
      })));
      setPolizas((pols.data?.data?.polizas || []).map((p: any) => ({
        ...p,
        fechavencimiento: p.fechavencimiento ? p.fechavencimiento.split('T')[0] : '',
        _modificado: false,
      })));
      setConductores(conds.data?.data?.conductores || []);
    }).catch(() => {});

    setArchivosDoc({});
    setArchivosPoliza({});
    setConductoresDesasignar([]);
    setDocConductor('');
    setBuscandoCond(false);
    setMostrarFormCond(false);
    setNuevoCond({
      nombre: '', apellido: '', telefono: '', correo: '',
      numerolicencia: '', categoriaslicencia: '', fechavencimientolicencia: '',
    });
    setArchivoLicenciaNuevo(null);
  }, [vehiculo]);

  useEffect(() => {
    if (modoProp !== 'buscar' || !docPropietario.trim()) return;
    const t = setTimeout(async () => {
      setBuscandoProp(true);
      try {
        const res = await propietariosApi.obtenerPorDocumento(docPropietario.trim());
        const p = res.data?.data?.propietario;
        if (p) { setPropietario(p); setModoProp('encontrado'); }
        else { setModoProp('crear'); }
      } catch { setModoProp('crear'); }
      finally { setBuscandoProp(false); }
    }, 600);
    return () => clearTimeout(t);
  }, [docPropietario, modoProp]);

  useEffect(() => {
    if (!docConductor.trim()) { setMostrarFormCond(false); return; }
    const t = setTimeout(async () => {
      setBuscandoCond(true);
      try {
        const res = await conductoresApi.obtenerPorDocumento(docConductor.trim());
        const c = res.data?.data?.conductor;
        if (c) {
          setConductores(prev =>
            prev.find(x => x.idusuario === c.idusuario) ? prev : [...prev, { ...c, esNuevo: true }]
          );
          setDocConductor('');
          setMostrarFormCond(false);
        } else {
          setMostrarFormCond(true);
        }
      } catch { setMostrarFormCond(true); }
      finally { setBuscandoCond(false); }
    }, 600);
    return () => clearTimeout(t);
  }, [docConductor]);

  const handleSubmit = async () => {
    setGuardando(true);
    setError('');
    try {
      const cambios: any = {};
      const campos = ['placa','numeromovil','idtiposervicio','idtipobus','modelo','cantidadpisos','anio','color','chasis','motor'];
      campos.forEach(k => {
        const v = (form as any)[k] === '' ? null : (form as any)[k];
        const orig = (vehiculo as any)[k] === undefined ? null : (vehiculo as any)[k];
        if (String(v ?? '') !== String(orig ?? '')) cambios[k] = v;
      });

      if (propietario?.idusuario && propietario.idusuario !== vehiculo.idusuariopropietario) {
        cambios.idusuariopropietario = propietario.idusuario;
      }

      if (distribucion) {
        const dist = distribucion.distribucion ? distribucion.distribucion : distribucion;
        const capacidadReal = Array.isArray(dist) ? dist.filter((a: any) => !a.vacio).length : parseInt(form.capacidad);
        cambios.distribucionasientos = distribucion.distribucion
          ? { distribucion: distribucion.distribucion, columnas: distribucion.columnas }
          : distribucion;
        cambios.capacidad = capacidadReal;
      }

      if (Object.keys(cambios).length > 0) {
        await vehiculosApi.actualizar(vehiculo.idvehiculo, cambios);
      }

      for (const doc of documentos) {
        if (doc._modificado || archivosDoc[doc.iddocumento]) {
          const fd = new FormData();
          fd.append('numerodocumento', doc.numerodocumento || '');
          fd.append('fechavencimiento', (doc.fechavencimiento || '').split('T')[0]);
          if (archivosDoc[doc.iddocumento]) fd.append('archivo', archivosDoc[doc.iddocumento]);
          await vehiculosApi.actualizarDocumento(doc.iddocumento, fd);
        }
      }

      for (const pol of polizas) {
        if (pol._modificado || archivosPoliza[pol.idpoliza]) {
          const fd = new FormData();
          fd.append('idaseguradora', pol.idaseguradora || '');
          fd.append('codigopoliza', pol.codigopoliza || '');
          fd.append('fechavencimiento', (pol.fechavencimiento || '').split('T')[0]);
          if (archivosPoliza[pol.idpoliza]) fd.append('archivo', archivosPoliza[pol.idpoliza]);
          await vehiculosApi.actualizarPoliza(pol.idpoliza, fd);
        }
      }

      for (const idusuario of conductoresDesasignar) {
        await vehiculosApi.desasignarConductor(vehiculo.idvehiculo, idusuario);
      }

      for (const c of conductores) {
        if (c.esNuevo && !c.esCrear) {
          await vehiculosApi.asignarConductor(vehiculo.idvehiculo, c.idusuario);
        }
      }

      for (const c of conductores) {
        if (c.esCrear) {
          const fd = new FormData();
          Object.entries(c).forEach(([k, v]) => {
            if (!['esNuevo','esCrear'].includes(k) && v !== undefined && v !== null)
              fd.append(k, v as any);
          });
          if (c._archivoLicencia) fd.append('licencia', c._archivoLicencia);
          const res = await conductoresApi.crear(fd);
          const nuevo = res.data?.data?.conductor;
          if (nuevo?.idusuario) {
            await vehiculosApi.asignarConductor(vehiculo.idvehiculo, nuevo.idusuario);
          }
        }
      }

      onActualizado?.();
      onCerrar();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const handleCrearPropietario = async () => {
    try {
      const res = await propietariosApi.crear(nuevoProp);
      const p = res.data?.data?.propietario;
      if (p) {
        setPropietario(p);
        setModoProp('encontrado');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al registrar propietario');
    }
  };

  const agregarConductorNuevo = () => {
    if (!nuevoCond.nombre || !nuevoCond.apellido || !nuevoCond.numerolicencia || !nuevoCond.fechavencimientolicencia) {
      alert('Complete los campos obligatorios del conductor');
      return;
    }
    const c = {
      ...nuevoCond,
      esNuevo: true,
      esCrear: true,
      _archivoLicencia: archivoLicenciaNuevo,
    };
    setConductores(prev => [...prev, c]);
    setMostrarFormCond(false);
    setDocConductor('');
    setNuevoCond({
      nombre: '', apellido: '', telefono: '', correo: '',
      numerolicencia: '', categoriaslicencia: '', fechavencimientolicencia: '',
    });
    setArchivoLicenciaNuevo(null);
  };

  if (!vehiculo) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-gray-150 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined font-black">edit_note</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800">
                Editar Expediente de Vehículo
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                Placa: {vehiculo.placa} • Móvil: {vehiculo.numeromovil}
              </p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Stepper horizontal */}
        <div className="px-6 py-3 border-b border-gray-100 bg-slate-50/50 overflow-x-auto flex items-center justify-between gap-4 select-none">
          {PASOS.map((paso, idx) => (
            <button
              key={paso}
              onClick={() => setPasoActual(idx)}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${
                pasoActual === idx
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 text-[9px] flex items-center justify-center font-black">
                {idx + 1}
              </span>
              <span>{paso}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-start gap-2 animate-shake">
              <span className="material-symbols-outlined text-sm font-black shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* PASO 0: PROPIETARIO */}
          {pasoActual === 0 && (
            <div className="space-y-5">
              <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex gap-3 text-xs text-blue-700">
                <span className="material-symbols-outlined text-base font-black">info</span>
                <div>
                  <p className="font-extrabold">Información del Propietario</p>
                  <p className="text-[11px] opacity-80 mt-0.5">Asigne o reemplace el propietario actual de la unidad.</p>
                </div>
              </div>

              {propietario ? (
                <div className="p-5 border border-green-200 bg-green-50/30 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
                      <span className="material-symbols-outlined font-black">person</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-green-800">
                        {propietario.nombre} {propietario.apellido}
                      </h4>
                      <p className="text-[10px] text-green-600 font-bold mt-0.5">
                        C.C. {propietario.documento} {propietario.telefono && `• Tel: ${propietario.telefono}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPropietario(null);
                      setModoProp('buscar');
                    }}
                    className="px-3.5 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-100 rounded-xl text-[11px] font-black transition-all cursor-pointer"
                  >
                    Desasignar Propietario
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                      Buscar Propietario por Cédula / Documento
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-lg">
                        search
                      </span>
                      <input
                        type="text"
                        value={docPropietario}
                        onChange={(e) => {
                          setDocPropietario(e.target.value);
                          setModoProp('buscar');
                        }}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold placeholder:text-gray-300 focus:border-primary outline-none transition-all"
                        placeholder="Ingrese número de documento para buscar..."
                      />
                      {buscandoProp && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      )}
                    </div>
                  </div>

                  {modoProp === 'crear' && (
                    <div className="p-5 bg-slate-50 border border-gray-150 rounded-2xl space-y-4">
                      <div className="text-[11px] text-amber-600 font-extrabold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm font-black">warning</span>
                        <span>No se encontró propietario con ese documento. Regístrelo a continuación:</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                            Nombre
                          </label>
                          <input
                            type="text"
                            value={nuevoProp.nombre}
                            onChange={(e) => setNuevoProp({ ...nuevoProp, nombre: e.target.value })}
                            className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                            placeholder="Nombre del propietario"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                            Apellido
                          </label>
                          <input
                            type="text"
                            value={nuevoProp.apellido}
                            onChange={(e) => setNuevoProp({ ...nuevoProp, apellido: e.target.value })}
                            className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                            placeholder="Apellido del propietario"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                            Teléfono
                          </label>
                          <input
                            type="text"
                            value={nuevoProp.telefono}
                            onChange={(e) => setNuevoProp({ ...nuevoProp, telefono: e.target.value })}
                            className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                            placeholder="Ej: 3001234567"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                            Correo Electrónico
                          </label>
                          <input
                            type="email"
                            value={nuevoProp.correo}
                            onChange={(e) => setNuevoProp({ ...nuevoProp, correo: e.target.value })}
                            className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                            placeholder="correo@ejemplo.com"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCrearPropietario}
                        className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md shadow-primary/10"
                      >
                        Crear y Asignar Propietario
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PASO 1: VEHÍCULO */}
          {pasoActual === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Placa
                </label>
                <input
                  type="text"
                  value={form.placa}
                  onChange={(e) => setForm({ ...form, placa: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-extrabold font-mono uppercase tracking-wider outline-none"
                  placeholder="AAA123"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Número Móvil
                </label>
                <input
                  type="text"
                  value={form.numeromovil}
                  onChange={(e) => setForm({ ...form, numeromovil: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  placeholder="Ej: 105"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Tipo de Servicio
                </label>
                <select
                  value={form.idtiposervicio}
                  onChange={(e) => setForm({ ...form, idtiposervicio: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none bg-white"
                >
                  <option value="">Seleccione...</option>
                  {tiposServicio.map((t: any) => (
                    <option key={t.idtiposervicio} value={t.idtiposervicio}>{t.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Tipo de Bus
                </label>
                <select
                  value={form.idtipobus}
                  onChange={(e) => setForm({ ...form, idtipobus: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none bg-white"
                >
                  <option value="">Seleccione...</option>
                  {tiposBus.map((t: any) => (
                    <option key={t.idtipobus} value={t.idtipobus}>{t.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Modelo / Año
                </label>
                <input
                  type="number"
                  value={form.anio}
                  onChange={(e) => setForm({ ...form, anio: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  placeholder="Ej: 2024"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Color
                </label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  placeholder="Ej: Blanco/Azul"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Número de Chasis
                </label>
                <input
                  type="text"
                  value={form.chasis}
                  onChange={(e) => setForm({ ...form, chasis: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  placeholder="Ej: A1234BC"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Número de Motor
                </label>
                <input
                  type="text"
                  value={form.motor}
                  onChange={(e) => setForm({ ...form, motor: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  placeholder="Ej: MOT987XYZ"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  Número de Pisos
                </label>
                <select
                  value={form.cantidadpisos}
                  onChange={(e) => setForm({ ...form, cantidadpisos: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none bg-white"
                >
                  <option value={1}>1 Piso</option>
                  <option value={2}>2 Pisos</option>
                </select>
              </div>
            </div>
          )}

          {/* PASO 2: ASIENTOS */}
          {pasoActual === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-extrabold text-gray-800">Distribución de la Cabina</h4>
                  <p className="text-gray-400 font-semibold mt-0.5">Use el editor interactivo para reordenar, agregar o inhabilitar asientos.</p>
                </div>
                <div className="px-3.5 py-1.5 bg-[#0D3B8E]/5 border border-[#0D3B8E]/10 rounded-xl text-[#0D3B8E] font-black uppercase text-[10px]">
                  Capacidad Total: {Array.isArray(distribucion?.distribucion) ? distribucion.distribucion.filter((a: any) => !a.vacio).length : form.capacidad || 0} Pasajeros
                </div>
              </div>

              <div className="border border-gray-150 rounded-2xl overflow-hidden min-h-[400px]">
                <DisenadorAsientos
                  capacidad={Number(form.capacidad) || 0}
                  valorInicial={distribucion}
                  onChange={(nuevaDist: any) => setDistribucion(nuevaDist)}
                />
              </div>
            </div>
          )}

          {/* PASO 3: DOCUMENTOS */}
          {pasoActual === 3 && (
            <div className="space-y-4">
              {documentos.map((doc, idx) => (
                <div key={doc.iddocumento} className="p-5 border border-gray-150 rounded-2xl bg-white space-y-4">
                  <div className="flex items-center justify-between gap-4 border-b border-gray-50 pb-3">
                    <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-lg">draft</span>
                      {doc.tipodocumento}
                    </h4>

                    {doc.archivourl && (
                      <button
                        onClick={() => abrirArchivo(doc.archivourl)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-gray-600 border border-gray-200 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        Ver Certificado
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                        Número de Documento
                      </label>
                      <input
                        type="text"
                        value={doc.numerodocumento || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDocumentos(prev => prev.map((d, i) => i === idx ? { ...d, numerodocumento: val, _modificado: true } : d));
                        }}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                        placeholder="Ingrese número de registro..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                        Fecha de Vencimiento
                      </label>
                      <input
                        type="date"
                        value={doc.fechavencimiento || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDocumentos(prev => prev.map((d, i) => i === idx ? { ...d, fechavencimiento: val, _modificado: true } : d));
                        }}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                      Reemplazar Archivo Adjunto (PDF/Imagen)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setArchivosDoc((prev: any) => ({ ...prev, [doc.iddocumento]: file }));
                        }
                      }}
                      className="w-full text-xs font-bold text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary/5 file:text-primary file:cursor-pointer hover:file:bg-primary/10"
                      accept=".pdf,image/*"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PASO 4: PÓLIZAS */}
          {pasoActual === 4 && (
            <div className="space-y-4">
              {polizas.map((pol, idx) => (
                <div key={pol.idpoliza} className="p-5 border border-gray-150 rounded-2xl bg-white space-y-4">
                  <div className="flex items-center justify-between gap-4 border-b border-gray-50 pb-3">
                    <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-lg">verified</span>
                      Póliza {pol.tipopoliza}
                    </h4>

                    {pol.archivourl && (
                      <button
                        onClick={() => abrirArchivo(pol.archivourl)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-gray-600 border border-gray-200 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        Ver Certificado
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                        Aseguradora
                      </label>
                      <select
                        value={pol.idaseguradora || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPolizas(prev => prev.map((p, i) => i === idx ? { ...p, idaseguradora: val, _modificado: true } : p));
                        }}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none bg-white"
                      >
                        <option value="">Seleccione...</option>
                        {aseguradoras.map((a: any) => (
                          <option key={a.idaseguradora} value={a.idaseguradora}>{a.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                        Código / Número de Póliza
                      </label>
                      <input
                        type="text"
                        value={pol.codigopoliza || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPolizas(prev => prev.map((p, i) => i === idx ? { ...p, codigopoliza: val, _modificado: true } : p));
                        }}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                        placeholder="Ingrese código..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                        Fecha de Vencimiento
                      </label>
                      <input
                        type="date"
                        value={pol.fechavencimiento || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPolizas(prev => prev.map((p, i) => i === idx ? { ...p, fechavencimiento: val, _modificado: true } : p));
                        }}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                      Reemplazar Archivo Adjunto (PDF/Imagen)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setArchivosPoliza((prev: any) => ({ ...prev, [pol.idpoliza]: file }));
                        }
                      }}
                      className="w-full text-xs font-bold text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary/5 file:text-primary file:cursor-pointer hover:file:bg-primary/10"
                      accept=".pdf,image/*"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PASO 5: CONDUCTORES */}
          {pasoActual === 5 && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <h4 className="text-xs font-black text-gray-700 mb-3">Conductores Actualmente Asignados</h4>
                
                {conductores.length === 0 ? (
                  <p className="text-xs text-gray-400 font-semibold italic text-center py-4">No hay conductores asignados a esta unidad.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {conductores.map((c: any, index: number) => (
                      <div
                        key={c.idusuario || index}
                        className="p-4 border border-gray-150 rounded-xl bg-white flex items-center justify-between gap-4 hover:shadow-sm transition-all"
                      >
                        <div>
                          <p className="text-xs font-black text-gray-800">{c.nombre} {c.apellido}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                            C.C. {c.documento} {c.numerolicencia && `• Lic: ${c.numerolicencia}`}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (c.idusuario) {
                              setConductoresDesasignar(prev => [...prev, c.idusuario]);
                              setConductores(prev => prev.filter(x => x.idusuario !== c.idusuario));
                            } else {
                              // Si es un conductor creado temporalmente, solo lo removemos
                              setConductores(prev => prev.filter((_, i) => i !== index));
                            }
                          }}
                          className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Agregar Conductor */}
              <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-4">
                <h4 className="text-xs font-black text-gray-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg text-slate-500">person_add</span>
                  Vincular / Registrar Conductor
                </h4>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    value={docConductor}
                    onChange={(e) => setDocConductor(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                    placeholder="Escriba documento para buscar en la base de datos..."
                  />
                  {buscandoCond && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  )}
                </div>

                {mostrarFormCond && (
                  <div className="p-4 bg-slate-50 border border-gray-150 rounded-xl space-y-4">
                    <div className="text-[11px] text-amber-600 font-extrabold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm font-black">warning</span>
                      <span>No se encontró conductor. Regístrelo para asignarlo:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={nuevoCond.nombre}
                          onChange={(e) => setNuevoCond({ ...nuevoCond, nombre: e.target.value })}
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none bg-white"
                          placeholder="Nombre"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                          Apellido
                        </label>
                        <input
                          type="text"
                          value={nuevoCond.apellido}
                          onChange={(e) => setNuevoCond({ ...nuevoCond, apellido: e.target.value })}
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none bg-white"
                          placeholder="Apellido"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                          Licencia de Conducción
                        </label>
                        <input
                          type="text"
                          value={nuevoCond.numerolicencia}
                          onChange={(e) => setNuevoCond({ ...nuevoCond, numerolicencia: e.target.value })}
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none bg-white"
                          placeholder="Número de licencia"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                          Fecha Vencimiento Licencia
                        </label>
                        <input
                          type="date"
                          value={nuevoCond.fechavencimientolicencia}
                          onChange={(e) => setNuevoCond({ ...nuevoCond, fechavencimientolicencia: e.target.value })}
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                          Categorías Licencia
                        </label>
                        <input
                          type="text"
                          value={nuevoCond.categoriaslicencia}
                          onChange={(e) => setNuevoCond({ ...nuevoCond, categoriaslicencia: e.target.value })}
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none bg-white"
                          placeholder="Ej: C2, C3"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          value={nuevoCond.telefono}
                          onChange={(e) => setNuevoCond({ ...nuevoCond, telefono: e.target.value })}
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none bg-white"
                          placeholder="Teléfono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                        Archivo de Licencia Adjunto (PDF/Imagen)
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setArchivoLicenciaNuevo(e.target.files?.[0] || null)}
                        className="w-full text-xs font-bold text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary/5 file:text-primary file:cursor-pointer hover:file:bg-primary/10"
                        accept=".pdf,image/*"
                      />
                    </div>

                    <button
                      onClick={agregarConductorNuevo}
                      className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      Agregar Conductor Registrado
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-gray-150 flex items-center justify-between gap-4">
          <button
            onClick={onCerrar}
            className="px-5 py-2.5 border border-gray-250 bg-white hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Cerrar sin guardar
          </button>

          <div className="flex items-center gap-3">
            {pasoActual > 0 && (
              <button
                onClick={() => setPasoActual(pasoActual - 1)}
                className="px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Anterior</span>
              </button>
            )}

            {pasoActual < PASOS.length - 1 ? (
              <button
                onClick={() => setPasoActual(pasoActual + 1)}
                className="px-5 py-2.5 bg-[#0D3B8E] hover:bg-[#0D3B8E]/95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Siguiente</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={guardando}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                style={{
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
                }}
              >
                {guardando ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm font-black">save</span>
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
