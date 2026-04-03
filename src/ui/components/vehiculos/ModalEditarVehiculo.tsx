import { useState, useEffect } from 'react';
import { vehiculosApi, propietariosApi, tiposBusApi, tiposServicioApi, aseguradorasApi, archivosApi } from '../../services/vehiculosApi';
import { conductoresApi } from '../../services/conductoresApi';
import DisenadorAsientos from './DisenadorAsientos';

const PASOS = ['Propietario', 'Vehículo', 'Asientos', 'Documentos', 'Pólizas', 'Conductores'];
const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

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
