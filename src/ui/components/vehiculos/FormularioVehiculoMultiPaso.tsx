import { useState, useEffect, useCallback } from 'react';
import { vehiculosApi, propietariosApi, tiposBusApi, tiposServicioApi, aseguradorasApi } from '../../../infrastructure/services/vehiculosApi';
import { conductoresApi } from '../../../infrastructure/services/conductoresApi';
import DisenadorAsientos from './DisenadorAsientos';

const PASOS = ['Propietario', 'Vehículo', 'Asientos', 'Documentos', 'Pólizas', 'Conductores'];
// Shared inline style constants
const IS: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '12px 16px',
  border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px',
  color: '#1e293b', backgroundColor: 'white', fontFamily: 'inherit', outline: 'none',
  transition: 'border-color 0.15s',
};
const LB: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px',
};
const REQ: React.CSSProperties = { color: '#ef4444', marginLeft: '2px' };
const FLD: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>
);
const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
  (e.currentTarget.style.borderColor = '#0D3B8E');
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
  (e.currentTarget.style.borderColor = '#e2e8f0');

interface FormularioVehiculoMultiPasoProps {
  onVehiculoCreado: () => void;
  onCancelar: () => void;
  vehiculoId?: string | null; // Si se pasa, entra en modo edición
}

export default function FormularioVehiculoMultiPaso({ onVehiculoCreado, onCancelar, vehiculoId }: FormularioVehiculoMultiPasoProps) {
  const modoEdicion = !!vehiculoId;
  const [pasoActual, setPasoActual] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(modoEdicion);
  const [exitoModal, setExitoModal] = useState<{ show: boolean; mensaje: string }>({ show: false, mensaje: '' });

  // Paso 1: Propietario
  const [docPropietario, setDocPropietario] = useState('');
  const [propietario, setPropietario] = useState<any>(null);
  const [buscandoProp, setBuscandoProp] = useState(false);
  const [modoProp, setModoProp] = useState('buscar');
  const [nuevoProp, setNuevoProp] = useState({ 
    nombre: '', apellido: '', tipodocumento: 'CC', documento: '', telefono: '', correo: '' 
  });

  // Paso 2: Vehículo
  const [vehiculo, setVehiculo] = useState({
    idtiposervicio: '', idtipobus: '', placa: '', numeromovil: '', marca: '',
    capacidad: '', cantidadpisos: 1, anio: new Date().getFullYear(), color: '', chasis: '', motor: ''
  });
  const [tiposBus, setTiposBus] = useState<any[]>([]);
  const [tiposServicio, setTiposServicio] = useState<any[]>([]);

  // Paso 3: Asientos
  const [distribucion, setDistribucion] = useState<any>(null);

  // Paso 4: Documentos
  const [documentos, setDocumentos] = useState<any>({
    SOAT: { numerodocumento: '', fechavencimiento: '', archivo: null },
    TECNICOMECANICA: { numerodocumento: '', fechavencimiento: '', archivo: null },
    LICENCIA_TRANSITO: { numerodocumento: '', fechavencimiento: '', archivo: null }
  });

  // Paso 5: Pólizas
  const [polizas, setPolizas] = useState<any>({
    CONTRACTUAL: { idaseguradora: '', codigopoliza: '', fechavencimiento: '', archivo: null },
    EXTRACONTRACTUAL: { idaseguradora: '', codigopoliza: '', fechavencimiento: '', archivo: null }
  });
  const [aseguradoras, setAseguradoras] = useState<any[]>([]);

  // Paso 6: Conductores
  const [conductores, setConductores] = useState<any[]>([]);
  const [conductoresReemplazo, setConductoresReemplazo] = useState<any[]>([]);
  const [docConductor, setDocConductor] = useState('');
  const [buscandoCond, setBuscandoCond] = useState(false);
  const [mostrarFormCond, setMostrarFormCond] = useState(false);
  const [nuevoCond, setNuevoCond] = useState({ 
    nombre: '', apellido: '', tipodocumento: 'CC', documento: '', telefono: '', 
    numerolicencia: '', categorialicencia: '', fechavencimientolicencia: '' 
  });
  const [archivoLicenciaNuevo, setArchivoLicenciaNuevo] = useState<File | null>(null);
  const [esReemplazo, setEsReemplazo] = useState(false);

  // Propietario como conductor
  const [propEsConductor, setPropEsConductor] = useState(false);
  const [propConductorData, setPropConductorData] = useState({ 
    numerolicencia: '', categorialicencia: '', fechavencimientolicencia: '' 
  });
  const [archivoLicenciaProp, setArchivoLicenciaProp] = useState<File | null>(null);
  const [propYaEsConductor, setPropYaEsConductor] = useState(false);

  // IDs de documentos/polizas existentes para poder actualizarlos
  const [idsDocumentos, setIdsDocumentos] = useState<Record<string,string>>({});
  const [idsPolizas, setIdsPolizas] = useState<Record<string,string>>({});

  useEffect(() => {
    cargarCatalogos();
  }, []);

  // Cargar datos del vehículo cuando se está en modo edición
  useEffect(() => {
    if (!vehiculoId) return;
    const cargarDatosVehiculo = async () => {
      setCargandoDatos(true);
      try {
        const [resVeh, resDocs, resPols, resConds] = await Promise.all([
          vehiculosApi.obtenerPorId(vehiculoId),
          vehiculosApi.obtenerDocumentos(vehiculoId).catch(() => ({ data: { data: { documentos: [] } } })),
          vehiculosApi.obtenerPolizas(vehiculoId).catch(() => ({ data: { data: { polizas: [] } } })),
          vehiculosApi.obtenerConductores(vehiculoId).catch(() => ({ data: { data: { conductores: [] } } })),
        ]);

        const v = resVeh.data.data?.vehiculo || resVeh.data.data;
        if (!v) throw new Error('No se pudo cargar el vehículo');

        // Paso 2: Datos del vehículo
        setVehiculo({
          idtiposervicio: String(v.idtiposervicio || ''),
          idtipobus: String(v.idtipobus || ''),
          placa: v.placa || '',
          numeromovil: v.numeromovil || '',
          marca: v.marca || '',
          capacidad: String(v.capacidad || ''),
          cantidadpisos: v.cantidadpisos || 1,
          anio: v.anio || new Date().getFullYear(),
          color: v.color || '',
          chasis: v.chasis || '',
          motor: v.motor || '',
        });

        // Paso 1: Propietario
        if (v.idusuariopropietario) {
          setPropietario({
            idusuario: v.idusuariopropietario,
            nombre: v.nombrepropietario || '',
            apellido: v.apellidopropietario || '',
            documento: v.documentopropietario || '',
          });
          setModoProp('encontrado');
        }

        // Paso 3: Asientos
        if (v.distribucionasientos) {
          const dist = typeof v.distribucionasientos === 'string'
            ? JSON.parse(v.distribucionasientos)
            : v.distribucionasientos;
          setDistribucion(dist);
        }

        // Paso 4: Documentos
        const docsRaw = resDocs.data.data?.documentos || [];
        const nuevosDocs: any = {
          SOAT: { numerodocumento: '', fechavencimiento: '', archivo: null },
          TECNICOMECANICA: { numerodocumento: '', fechavencimiento: '', archivo: null },
          LICENCIA_TRANSITO: { numerodocumento: '', fechavencimiento: '', archivo: null },
        };
        const nuevosIdsDoc: Record<string,string> = {};
        docsRaw.forEach((d: any) => {
          if (nuevosDocs[d.tipodocumento] !== undefined) {
            nuevosDocs[d.tipodocumento] = {
              numerodocumento: d.numerodocumento || '',
              fechavencimiento: d.fechavencimiento ? d.fechavencimiento.substring(0,10) : '',
              archivo: null, // No podemos pre-cargar el archivo, solo la info
              archivoUrlExistente: d.archivourl || null,
            };
            nuevosIdsDoc[d.tipodocumento] = d.iddocumento;
          }
        });
        setDocumentos(nuevosDocs);
        setIdsDocumentos(nuevosIdsDoc);

        // Paso 5: Pólizas
        const polsRaw = resPols.data.data?.polizas || [];
        const nuevasPols: any = {
          CONTRACTUAL: { idaseguradora: '', codigopoliza: '', fechavencimiento: '', archivo: null },
          EXTRACONTRACTUAL: { idaseguradora: '', codigopoliza: '', fechavencimiento: '', archivo: null },
        };
        const nuevosIdsPoliza: Record<string,string> = {};
        polsRaw.forEach((p: any) => {
          if (nuevasPols[p.tipopoliza] !== undefined) {
            nuevasPols[p.tipopoliza] = {
              idaseguradora: String(p.idaseguradora || ''),
              codigopoliza: p.codigopoliza || '',
              fechavencimiento: p.fechavencimiento ? p.fechavencimiento.substring(0,10) : '',
              archivo: null,
              archivoUrlExistente: p.archivourl || null,
            };
            nuevosIdsPoliza[p.tipopoliza] = p.idpoliza;
          }
        });
        setPolizas(nuevasPols);
        setIdsPolizas(nuevosIdsPoliza);

        // Paso 6: Conductores (separar principales y reemplazo)
        const condsRaw = resConds.data.data?.conductores || [];
        const principales = condsRaw.filter((c: any) => !c.esremplazo).map((c: any) => ({ ...c, esNuevo: false }));
        const reemplazos = condsRaw.filter((c: any) => c.esremplazo).map((c: any) => ({ ...c, esNuevo: false }));
        setConductores(principales);
        setConductoresReemplazo(reemplazos);

      } catch (err: any) {
        alert('Error al cargar datos del vehículo: ' + (err.message || 'Error desconocido'));
        onCancelar();
      } finally {
        setCargandoDatos(false);
      }
    };
    cargarDatosVehiculo();
  }, [vehiculoId]);

  const cargarCatalogos = async () => {
    try {
      const [tb, ts, aseg] = await Promise.all([
        tiposBusApi.obtenerActivos().catch(() => ({ data: { data: { tiposBus: [] } } })),
        tiposServicioApi.obtenerActivos().catch(() => ({ data: { data: { tiposServicio: [] } } })),
        aseguradorasApi.obtenerActivas().catch(() => ({ data: { data: { aseguradoras: [] } } }))
      ]);
      setTiposBus(tb.data.data?.tiposBus || tb.data.data?.tiposbus || []);
      setTiposServicio(ts.data.data?.tiposServicio || ts.data.data?.tiposservicio || []);
      setAseguradoras(aseg.data.data?.aseguradoras || []);
    } catch (err) { 
      console.error('Error cargando catálogos:', err); 
    }
  };

  const buscarPropietario = useCallback(async (doc?: string) => {
    const d = (doc || docPropietario).trim();
    if (!d || d.length < 5) return;
    setBuscandoProp(true);
    try {
      const res = await propietariosApi.obtenerPorDocumento(d);
      if (res.data.success && res.data.data.propietario) {
        setPropietario(res.data.data.propietario);
        setModoProp('encontrado');
        try {
          const resCond = await conductoresApi.obtenerPorDocumento(d);
          setPropYaEsConductor(resCond.data.success && resCond.data.data.conductor);
        } catch { setPropYaEsConductor(false); }
      } else {
        setPropietario(null);
        setModoProp('crear');
        setNuevoProp(prev => ({ ...prev, documento: d }));
      }
    } catch {
      setPropietario(null);
      setModoProp('crear');
      setNuevoProp(prev => ({ ...prev, documento: d }));
    } finally { setBuscandoProp(false); }
  }, [docPropietario]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (docPropietario.trim().length >= 5) buscarPropietario();
    }, 600);
    return () => clearTimeout(timeout);
  }, [docPropietario, buscarPropietario]);

  const crearPropietario = async () => {
    try {
      const res = await propietariosApi.crear(nuevoProp);
      setPropietario(res.data.data.propietario);
      setModoProp('encontrado');
      setPropYaEsConductor(false);
    } catch (err: any) { 
      alert(err.response?.data?.message || 'Error al crear propietario'); 
    }
  };

  const limpiarPropietario = () => { 
    setPropietario(null); 
    setDocPropietario(''); 
    setModoProp('buscar'); 
    setPropEsConductor(false); 
    setPropYaEsConductor(false); 
  };

  const buscarConductor = async () => {
    const d = docConductor.trim();
    if (!d) return;
    setBuscandoCond(true);
    setMostrarFormCond(false);
    try {
      const res = await conductoresApi.obtenerPorDocumento(d);
      if (res.data.success && res.data.data.conductor) {
        const c = res.data.data.conductor;
        const yaAsignado = conductores.find(x => (x.idusuario || x.documento) === (c.idusuario || c.documento)) ||
                          conductoresReemplazo.find(x => (x.idusuario || x.documento) === (c.idusuario || c.documento));
        if (yaAsignado) {
          alert('Este conductor ya está asignado');
        } else {
          if (esReemplazo) {
            setConductoresReemplazo(prev => [...prev, { ...c, esNuevo: false }]);
          } else {
            setConductores(prev => [...prev, { ...c, esNuevo: false }]);
          }
          setDocConductor('');
          setEsReemplazo(false);
        }
      } else {
        setMostrarFormCond(true);
        setNuevoCond(prev => ({ ...prev, documento: d }));
      }
    } catch {
      setMostrarFormCond(true);
      setNuevoCond(prev => ({ ...prev, documento: d }));
    } finally { setBuscandoCond(false); }
  };

  const agregarConductorNuevo = () => {
    if (!nuevoCond.nombre || !nuevoCond.apellido || !nuevoCond.numerolicencia || 
        !nuevoCond.categorialicencia || !nuevoCond.fechavencimientolicencia) {
      alert('Complete todos los campos obligatorios del conductor');
      return;
    }
    if (!archivoLicenciaNuevo) {
      alert('Debe adjuntar el archivo de la licencia');
      return;
    }
    
    const conductorCompleto = { 
      ...nuevoCond, 
      archivoLicencia: archivoLicenciaNuevo, 
      esNuevo: true 
    };
    
    console.log('=== Agregando conductor ===');
    console.log('Es reemplazo:', esReemplazo);
    console.log('Datos del conductor:', conductorCompleto);
    
    if (esReemplazo) {
      setConductoresReemplazo(prev => {
        const nuevaLista = [...prev, conductorCompleto];
        console.log('Nueva lista de conductores reemplazo:', nuevaLista);
        return nuevaLista;
      });
    } else {
      setConductores(prev => {
        const nuevaLista = [...prev, conductorCompleto];
        console.log('Nueva lista de conductores principales:', nuevaLista);
        return nuevaLista;
      });
    }
    setMostrarFormCond(false);
    setDocConductor('');
    setEsReemplazo(false);
    setNuevoCond({ 
      nombre: '', apellido: '', tipodocumento: 'CC', documento: '', telefono: '', 
      numerolicencia: '', categorialicencia: '', fechavencimientolicencia: '' 
    });
    setArchivoLicenciaNuevo(null);
  };

  const handleSubmit = async () => {
    if (!propietario) return alert('Debe asignar un propietario');
    const totalCond = conductores.length + (propEsConductor ? 1 : 0);
    if (!modoEdicion && totalCond < 2) return alert('Debe asignar al menos 2 conductores');
    if (!distribucion) return alert('Debe configurar la distribución de asientos');

    setGuardando(true);
    try {
      const capacidadReal = distribucion?.distribucion
        ? distribucion.distribucion.filter((a: any) => !a.vacio && !a.esBano).length
        : parseInt(vehiculo.capacidad);

      // ─── MODO EDICIÓN ──────────────────────────────────────────────
      if (modoEdicion && vehiculoId) {
        // 1. Actualizar datos básicos del vehículo
        await vehiculosApi.actualizar(vehiculoId, {
          ...vehiculo,
          idtiposervicio: parseInt(vehiculo.idtiposervicio),
          idtipobus: parseInt(vehiculo.idtipobus),
          idusuariopropietario: propietario.idusuario,
          capacidad: capacidadReal,
          cantidadpisos: parseInt(String(vehiculo.cantidadpisos)),
          anio: parseInt(String(vehiculo.anio)),
          distribucionasientos: distribucion,
        });

        // 2. Actualizar documentos (si tienen ID asignado)
        await Promise.all(
          Object.entries(documentos).map(async ([tipo, d]: [string, any]) => {
            const idDoc = idsDocumentos[tipo];
            if (!idDoc) return; // Sin ID no podemos actualizar
            
            // Si hay archivo nuevo, usar FormData
            if (d.archivo) {
              const fd = new FormData();
              fd.append('numerodocumento', d.numerodocumento);
              fd.append('fechavencimiento', d.fechavencimiento);
              fd.append('archivo', d.archivo);
              await vehiculosApi.actualizarDocumento(idDoc, fd).catch(console.error);
            } else {
              // Si no hay archivo, enviar JSON normal
              await vehiculosApi.actualizarDocumento(idDoc, {
                numerodocumento: d.numerodocumento,
                fechavencimiento: d.fechavencimiento
              }).catch(console.error);
            }
          })
        );

        // 3. Actualizar pólizas (si tienen ID asignado)
        await Promise.all(
          Object.entries(polizas).map(async ([tipo, p]: [string, any]) => {
            const idPol = idsPolizas[tipo];
            if (!idPol) return;
            
            // Si hay archivo nuevo, usar FormData
            if (p.archivo) {
              const fd = new FormData();
              fd.append('idaseguradora', p.idaseguradora);
              fd.append('codigopoliza', p.codigopoliza);
              fd.append('fechavencimiento', p.fechavencimiento);
              fd.append('archivo', p.archivo);
              await vehiculosApi.actualizarPoliza(idPol, fd).catch(console.error);
            } else {
              // Si no hay archivo, enviar JSON normal
              await vehiculosApi.actualizarPoliza(idPol, {
                idaseguradora: p.idaseguradora,
                codigopoliza: p.codigopoliza,
                fechavencimiento: p.fechavencimiento
              }).catch(console.error);
            }
          })
        );

        // 4. Conductores principales nuevos (crear y asignar)
        const conductoresNuevosParaCrear = conductores.filter(c => c.esNuevo && !c.idusuario);
        for (const c of conductoresNuevosParaCrear) {
          try {
            // Crear el conductor primero
            const formData = new FormData();
            formData.append('nombre', c.nombre);
            formData.append('apellido', c.apellido);
            formData.append('tipodocumento', c.tipodocumento);
            formData.append('documento', c.documento);
            formData.append('telefono', c.telefono);
            formData.append('numerolicencia', c.numerolicencia);
            formData.append('categorialicencia', c.categorialicencia);
            formData.append('fechavencimientolicencia', c.fechavencimientolicencia);
            if (c.archivoLicencia) {
              formData.append('licencia', c.archivoLicencia);
            }
            
            const resConductor = await conductoresApi.crear(formData);
            const conductorCreado = resConductor.data.data.conductor;
            
            // Asignar al vehículo
            await vehiculosApi.asignarConductor(vehiculoId, conductorCreado.idusuario, false);
          } catch (error) {
            console.error('Error creando/asignando conductor principal:', error);
          }
        }
        
        // 5. Conductores principales existentes (solo asignar)
        const conductoresExistentesParaAsignar = conductores.filter(c => !c.esNuevo && c.idusuario);
        for (const c of conductoresExistentesParaAsignar) {
          try {
            await vehiculosApi.asignarConductor(vehiculoId, c.idusuario, false);
          } catch (error) {
            console.error('Error asignando conductor principal existente:', error);
          }
        }
        
        // 6. Conductores de reemplazo nuevos (crear y asignar)
        const conductoresReemplazoNuevosParaCrear = conductoresReemplazo.filter(c => c.esNuevo && !c.idusuario);
        console.log('=== Creando conductores de reemplazo nuevos ===');
        console.log('Cantidad:', conductoresReemplazoNuevosParaCrear.length);
        console.log('Conductores:', conductoresReemplazoNuevosParaCrear);
        
        for (const c of conductoresReemplazoNuevosParaCrear) {
          try {
            console.log('Creando conductor de reemplazo:', c.nombre, c.apellido);
            // Crear el conductor primero
            const formData = new FormData();
            formData.append('nombre', c.nombre);
            formData.append('apellido', c.apellido);
            formData.append('tipodocumento', c.tipodocumento);
            formData.append('documento', c.documento);
            formData.append('telefono', c.telefono);
            formData.append('numerolicencia', c.numerolicencia);
            formData.append('categorialicencia', c.categorialicencia);
            formData.append('fechavencimientolicencia', c.fechavencimientolicencia);
            if (c.archivoLicencia) {
              formData.append('licencia', c.archivoLicencia);
            }
            
            const resConductor = await conductoresApi.crear(formData);
            const conductorCreado = resConductor.data.data.conductor;
            console.log('Conductor creado:', conductorCreado);
            
            // Asignar al vehículo como reemplazo
            console.log('Asignando conductor al vehículo como reemplazo...');
            await vehiculosApi.asignarConductor(vehiculoId, conductorCreado.idusuario, true);
            console.log('Conductor asignado exitosamente');
          } catch (error) {
            console.error('Error creando/asignando conductor de reemplazo:', error);
          }
        }
        
        // 7. Conductores de reemplazo existentes (solo asignar)
        const conductoresReemplazoExistentesParaAsignar = conductoresReemplazo.filter(c => !c.esNuevo && c.idusuario);
        for (const c of conductoresReemplazoExistentesParaAsignar) {
          try {
            await vehiculosApi.asignarConductor(vehiculoId, c.idusuario, true);
          } catch (error) {
            console.error('Error asignando conductor de reemplazo existente:', error);
          }
        }

        setExitoModal({ show: true, mensaje: 'El vehículo ha sido actualizado correctamente.' });
        onVehiculoCreado();
        return;
      }

      // ─── MODO CREACIÓN ─────────────────────────────────────────────
      const fd = new FormData();
      
      console.log('=== Estado actual de conductores ===');
      console.log('conductores array:', conductores);
      console.log('conductoresReemplazo array:', conductoresReemplazo);
      
      const conductoresExistentes = conductores.filter(c => !c.esNuevo).map(c => c.idusuario);
      const conductoresNuevos = conductores.filter(c => c.esNuevo).map(c => ({
        nombre: c.nombre, apellido: c.apellido, tipodocumento: c.tipodocumento,
        documento: c.documento, telefono: c.telefono, numerolicencia: c.numerolicencia,
        categorialicencia: c.categorialicencia, fechavencimientolicencia: c.fechavencimientolicencia
      }));

      const conductoresReemplazoExistentes = conductoresReemplazo.filter(c => !c.esNuevo).map(c => c.idusuario);
      const conductoresReemplazoNuevos = conductoresReemplazo.filter(c => c.esNuevo).map(c => ({
        nombre: c.nombre, apellido: c.apellido, tipodocumento: c.tipodocumento,
        documento: c.documento, telefono: c.telefono, numerolicencia: c.numerolicencia,
        categorialicencia: c.categorialicencia, fechavencimientolicencia: c.fechavencimientolicencia
      }));

      const data = {
        vehiculo: {
          ...vehiculo,
          idtiposervicio: parseInt(vehiculo.idtiposervicio),
          idtipobus: parseInt(vehiculo.idtipobus),
          idusuariopropietario: propietario.idusuario,
          capacidad: capacidadReal,
          cantidadpisos: parseInt(String(vehiculo.cantidadpisos)),
          anio: parseInt(String(vehiculo.anio)),
          distribucionasientos: distribucion
        },
        documentos: Object.entries(documentos).map(([tipo, d]: [string, any]) => ({
          tipodocumento: tipo, numerodocumento: d.numerodocumento, fechavencimiento: d.fechavencimiento
        })),
        polizas: Object.entries(polizas).map(([tipo, p]: [string, any]) => ({
          tipopoliza: tipo, idaseguradora: parseInt(p.idaseguradora), codigopoliza: p.codigopoliza, fechavencimiento: p.fechavencimiento
        })),
        conductores: conductoresExistentes,
        conductoresNuevos,
        conductoresReemplazoIds: conductoresReemplazoExistentes,
        conductoresReemplazoNuevos,
        propietarioConductor: propEsConductor && !propYaEsConductor ? {
          numerolicencia: propConductorData.numerolicencia,
          categorialicencia: propConductorData.categorialicencia,
          fechavencimientolicencia: propConductorData.fechavencimientolicencia
        } : (propEsConductor && propYaEsConductor ? { yaExiste: true } : null)
      };
      
      console.log('=== DEBUG: Datos a enviar ===');
      console.log('Conductores existentes:', conductoresExistentes);
      console.log('Conductores nuevos:', conductoresNuevos);
      console.log('Conductores reemplazo existentes:', conductoresReemplazoExistentes);
      console.log('Conductores reemplazo nuevos:', conductoresReemplazoNuevos);
      console.log('Data completa:', data);
      
      fd.append('data', JSON.stringify(data));

      Object.entries(documentos).forEach(([tipo, d]: [string, any]) => {
        if (d.archivo) fd.append(`documento_${tipo}`, d.archivo);
      });
      Object.entries(polizas).forEach(([tipo, p]: [string, any]) => {
        if (p.archivo) fd.append(`poliza_${tipo}`, p.archivo);
      });
      if (propEsConductor && !propYaEsConductor && archivoLicenciaProp) {
        fd.append('licencia_propietario', archivoLicenciaProp);
      }
      
      console.log('=== Adjuntando archivos de licencias ===');
      conductores.filter(c => c.esNuevo).forEach(c => {
        console.log(`Adjuntando licencia_nuevo_${c.documento}:`, c.archivoLicencia);
        if (c.archivoLicencia) fd.append(`licencia_nuevo_${c.documento}`, c.archivoLicencia);
      });
      conductoresReemplazo.filter(c => c.esNuevo).forEach(c => {
        console.log(`Adjuntando licencia_reemplazo_${c.documento}:`, c.archivoLicencia);
        if (c.archivoLicencia) fd.append(`licencia_reemplazo_${c.documento}`, c.archivoLicencia);
      });

      console.log('=== Enviando al backend ===');
      await vehiculosApi.crear(fd);
      setExitoModal({ show: true, mensaje: 'El vehículo ha sido registrado correctamente en el sistema.' });
      onVehiculoCreado();
    } catch (err: any) { 
      alert(err.response?.data?.message || 'Error al guardar vehículo'); 
    } finally { 
      setGuardando(false); 
    }
  };

  const siguiente = () => setPasoActual(p => Math.min(p + 1, PASOS.length - 1));
  const anterior = () => setPasoActual(p => Math.max(p - 1, 0));

  // ===== RENDER PASOS =====
  const renderPaso1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px' }}>
        <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '20px', marginTop: '1px' }}>info</span>
        <span style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: '1.5' }}>Busque el propietario por documento. Si no existe, podrá crearlo.</span>
      </div>

      {modoProp === 'encontrado' && propietario ? (
        <div className="space-y-4">
        <div style={{ padding: '14px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: '#ffffff', fontSize: '22px' }}>person</span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#166534' }}>{propietario.nombre} {propietario.apellido}</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#15803d' }}>Doc: {propietario.documento} | Tel: {propietario.telefono || 'N/A'}</p>
            </div>
          </div>
          <button type="button" onClick={limpiarPropietario} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span className="material-symbols-outlined" style={{ color: '#dc2626', fontSize: '20px' }}>close</span>
          </button>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s', marginTop: '20px' }} onClick={() => setPropEsConductor(!propEsConductor)} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', border: propEsConductor ? 'none' : '2px solid #cbd5e1', backgroundColor: propEsConductor ? '#3b82f6' : 'transparent', transition: 'all 0.2s' }}>
                {propEsConductor && <span className="material-symbols-outlined" style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>check</span>}
            </div>
            <span style={{ fontSize: '13px', color: '#374151', fontWeight: 600, userSelect: 'none' }}>
              ¿El propietario también será conductor de este vehículo?
            </span>
        </div>

        {propEsConductor && propYaEsConductor && (
          <div style={{ padding: '14px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '12px' }}>
            <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '20px' }}>check_circle</span>
            <p style={{ margin: 0, fontSize: '13px', color: '#1e3a8a', fontWeight: 500, lineHeight: 1.5 }}>Este propietario ya está registrado como conductor oficial. Su perfil será asignado automáticamente a este vehículo.</p>
          </div>
        )}

        {propEsConductor && !propYaEsConductor && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '14px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>badge</span>
              </div>
              <div>
                 <p style={{ margin: 0, fontSize: '14px', color: '#111827', fontWeight: 700 }}>Licencia de Conducción</p>
                 <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Complete los datos obligatorios para habilitarlo como conductor</p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <FLD>
                <label style={LB}>Nº Licencia <span style={REQ}>*</span></label>
                <input 
                  type="text" 
                  value={propConductorData.numerolicencia}
                  onChange={(e) => setPropConductorData(p => ({ ...p, numerolicencia: e.target.value }))} 
                  style={IS}
                  placeholder="Ej: 123456789"
                  onFocus={onFocus} onBlur={onBlur}
                />
              </FLD>
              <FLD>
                <label style={LB}>Categoría <span style={REQ}>*</span></label>
                <select 
                  value={propConductorData.categorialicencia}
                  onChange={(e) => setPropConductorData(p => ({ ...p, categorialicencia: e.target.value }))} 
                  style={{ ...IS, cursor: 'pointer' }}
                  onFocus={onFocus} onBlur={onBlur}
                >
                  <option value="">Seleccionar...</option>
                  {['A1','A2','B1','B2','B3','C1','C2','C3'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FLD>
            </div>
            <FLD>
              <label style={LB}>Fecha vencimiento <span style={REQ}>*</span></label>
              <input 
                type="date" 
                value={propConductorData.fechavencimientolicencia}
                onChange={(e) => setPropConductorData(p => ({ ...p, fechavencimientolicencia: e.target.value }))} 
                style={IS}
                onFocus={onFocus} onBlur={onBlur}
              />
            </FLD>
            <FLD>
              <label style={LB}>Archivo escaneado <span style={REQ}>*</span></label>
              {archivoLicenciaProp ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: '20px' }}>check_circle</span> 
                  <span style={{ fontSize: '13px', color: '#166534', fontWeight: 600 }}>{archivoLicenciaProp.name}</span>
                </div>
              ) : null}
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', border: '2px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f9fafb', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#eff6ff'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.backgroundColor = '#f9fafb'; }}>
                <span className="material-symbols-outlined" style={{ color: '#6b7280', fontSize: '22px' }}>description</span>
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>{archivoLicenciaProp ? 'Cambiar Archivo (PDF/IMG)' : 'Seleccionar Archivo (PDF/IMG)'}</span>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(e) => setArchivoLicenciaProp(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
              </label>
            </FLD>
          </div>
        )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ color: '#9ca3af', fontSize: '20px' }}>search</span>
            </span>
            <input 
              type="text" 
              value={docPropietario}
              onChange={(e) => { setDocPropietario(e.target.value); setModoProp('buscar'); }}
              style={{ width: '100%', paddingLeft: '44px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', backgroundColor: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              placeholder="Escriba el documento del propietario..."
              onFocus={e => (e.currentTarget.style.borderColor = '#3b82f6')}
              onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
            />
            {buscandoProp && (
              <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', animation: 'spin 1s linear infinite' }}>progress_activity</span>
              </span>
            )}
          </div>

          {modoProp === 'crear' && (
            <div style={{ padding: '20px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '14px', borderBottom: '1px solid #bfdbfe', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '20px' }}>person_add</span>
                <p style={{ margin: 0, fontSize: '13px', color: '#1e3a8a', fontWeight: 600 }}>No encontrado. Crear propietario: {nuevoProp.documento}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <FLD>
                  <label style={LB}>Nombre <span style={REQ}>*</span></label>
                  <input type="text" style={IS} placeholder="Ej: Juan" value={nuevoProp.nombre} onChange={(e) => setNuevoProp(p => ({ ...p, nombre: e.target.value }))} onFocus={onFocus} onBlur={onBlur} />
                </FLD>
                <FLD>
                  <label style={LB}>Apellido <span style={REQ}>*</span></label>
                  <input type="text" style={IS} placeholder="Ej: Pérez" value={nuevoProp.apellido} onChange={(e) => setNuevoProp(p => ({ ...p, apellido: e.target.value }))} onFocus={onFocus} onBlur={onBlur} />
                </FLD>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <FLD>
                  <label style={LB}>Teléfono <span style={REQ}>*</span></label>
                  <input type="text" style={IS} placeholder="Ej: 3001234567" value={nuevoProp.telefono} onChange={(e) => setNuevoProp(p => ({ ...p, telefono: e.target.value }))} onFocus={onFocus} onBlur={onBlur} />
                </FLD>
                <FLD>
                  <label style={LB}>Correo (opcional)</label>
                  <input type="email" style={IS} placeholder="correo@ejemplo.com" value={nuevoProp.correo} onChange={(e) => setNuevoProp(p => ({ ...p, correo: e.target.value }))} onFocus={onFocus} onBlur={onBlur} />
                </FLD>
              </div>
              <button 
                type="button" 
                onClick={crearPropietario}
                style={{ width: '100%', backgroundColor: '#3b82f6', color: '#ffffff', fontSize: '13px', fontWeight: 600, padding: '11px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span> 
                Crear y asignar propietario
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );



  const renderPaso2 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FLD>
          <label style={LB}>Tipo de Servicio <span style={REQ}>*</span></label>
          <select style={IS} value={vehiculo.idtiposervicio} onChange={(e) => setVehiculo(v => ({ ...v, idtiposervicio: e.target.value }))} onFocus={onFocus} onBlur={onBlur}>
            <option value="">Seleccionar...</option>
            {tiposServicio.map(t => <option key={t.idtiposervicio} value={t.idtiposervicio}>{t.nombre}</option>)}
          </select>
        </FLD>
        <FLD>
          <label style={LB}>Tipo de Bus <span style={REQ}>*</span></label>
          <select style={IS} value={vehiculo.idtipobus} onChange={(e) => setVehiculo(v => ({ ...v, idtipobus: e.target.value }))} onFocus={onFocus} onBlur={onBlur}>
            <option value="">Seleccionar...</option>
            {tiposBus.map(t => <option key={t.idtipobus} value={t.idtipobus}>{t.nombre}</option>)}
          </select>
        </FLD>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FLD>
          <label style={LB}>Placa <span style={REQ}>*</span></label>
          <input type="text" style={{ ...IS, textTransform: 'uppercase' }} value={vehiculo.placa} onChange={(e) => setVehiculo(v => ({ ...v, placa: e.target.value }))} placeholder="ABC-123" onFocus={onFocus} onBlur={onBlur} />
        </FLD>
        <FLD>
          <label style={LB}>Número Móvil <span style={REQ}>*</span></label>
          <input type="text" style={IS} value={vehiculo.numeromovil} onChange={(e) => setVehiculo(v => ({ ...v, numeromovil: e.target.value }))} placeholder="1045" onFocus={onFocus} onBlur={onBlur} />
        </FLD>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <FLD>
          <label style={LB}>Marca</label>
          <input type="text" style={IS} value={vehiculo.marca} onChange={(e) => setVehiculo(v => ({ ...v, marca: e.target.value }))} placeholder="Ej: Mercedes Benz" onFocus={onFocus} onBlur={onBlur} />
        </FLD>
        <FLD>
          <label style={LB}>Capacidad <span style={REQ}>*</span></label>
          <input type="number" style={IS} value={vehiculo.capacidad} onChange={(e) => setVehiculo(v => ({ ...v, capacidad: e.target.value }))} min="1" placeholder="42" onFocus={onFocus} onBlur={onBlur} />
        </FLD>
        <FLD>
          <label style={LB}>Pisos</label>
          <input type="number" style={IS} value={vehiculo.cantidadpisos} onChange={(e) => setVehiculo(v => ({ ...v, cantidadpisos: Number(e.target.value) }))} min="1" max="2" onFocus={onFocus} onBlur={onBlur} />
        </FLD>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <FLD>
          <label style={LB}>Año</label>
          <input type="number" style={IS} value={vehiculo.anio} onChange={(e) => setVehiculo(v => ({ ...v, anio: Number(e.target.value) }))} placeholder="2024" onFocus={onFocus} onBlur={onBlur} />
        </FLD>
        <FLD>
          <label style={LB}>Color</label>
          <input type="text" style={IS} value={vehiculo.color} onChange={(e) => setVehiculo(v => ({ ...v, color: e.target.value }))} placeholder="Blanco" onFocus={onFocus} onBlur={onBlur} />
        </FLD>
        <FLD>
          <label style={LB}>Chasis</label>
          <input type="text" style={IS} value={vehiculo.chasis} onChange={(e) => setVehiculo(v => ({ ...v, chasis: e.target.value }))} onFocus={onFocus} onBlur={onBlur} />
        </FLD>
        <FLD>
          <label style={LB}>Motor</label>
          <input type="text" style={IS} value={vehiculo.motor} onChange={(e) => setVehiculo(v => ({ ...v, motor: e.target.value }))} onFocus={onFocus} onBlur={onBlur} />
        </FLD>
      </div>
    </div>
  );

  const renderPaso3 = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
      <DisenadorAsientos 
        capacidad={parseInt(vehiculo.capacidad) || 0} 
        onChange={(dist) => {
          setDistribucion(dist);
          // Sincronizar la capacidad si hay cambios en el diseñador
          if (dist?.distribucion) {
            const realCap = dist.distribucion.filter((a: any) => !a.vacio && !a.esPasillo).length;
            if (realCap !== parseInt(vehiculo.capacidad)) {
              setVehiculo(v => ({ ...v, capacidad: String(realCap) }));
            }
          }
        }} 
        valorInicial={distribucion?.distribucion} 
      />
    </div>
  );


  const renderPaso4 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {['SOAT', 'TECNICOMECANICA', 'LICENCIA_TRANSITO'].map(tipo => (
        <div key={tipo} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
            <span className="material-symbols-outlined" style={{ color: '#0D3B8E', fontSize: '20px' }}>description</span>
            {tipo.replace('_', ' ')}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <FLD>
              <label style={LB}>Número documento</label>
              <input type="text" style={IS} value={documentos[tipo].numerodocumento} onChange={(e) => setDocumentos((d: any) => ({ ...d, [tipo]: { ...d[tipo], numerodocumento: e.target.value } }))} placeholder="Ej: 123456789" onFocus={onFocus} onBlur={onBlur} />
            </FLD>
            <FLD>
              <label style={LB}>Fecha vencimiento <span style={REQ}>*</span></label>
              <input type="date" style={IS} value={documentos[tipo].fechavencimiento} onChange={(e) => setDocumentos((d: any) => ({ ...d, [tipo]: { ...d[tipo], fechavencimiento: e.target.value } }))} onFocus={onFocus} onBlur={onBlur} />
            </FLD>
          </div>
          <FLD>
            <label style={LB}>Archivo (imagen/PDF)</label>
            {documentos[tipo].archivo && (
              <div style={{ marginBottom: '8px', fontSize: '12px', color: '#15803d', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f0fdf4', padding: '8px', borderRadius: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span> 
                Archivo: {documentos[tipo].archivo.name}
              </div>
            )}
            <input type="file" accept="image/*,.pdf" onChange={(e) => setDocumentos((d: any) => ({ ...d, [tipo]: { ...d[tipo], archivo: e.target.files?.[0] || d[tipo].archivo } }))} style={{ ...IS, paddingTop: '6px', paddingBottom: '6px', cursor: 'pointer' }} />
          </FLD>
        </div>
      ))}
    </div>
  );

  const renderPaso5 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {['CONTRACTUAL', 'EXTRACONTRACTUAL'].map(tipo => (
        <div key={tipo} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
            <span className="material-symbols-outlined" style={{ color: '#0D3B8E', fontSize: '20px' }}>shield</span>
            Póliza {tipo}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <FLD>
              <label style={LB}>Aseguradora <span style={REQ}>*</span></label>
              <select style={IS} value={polizas[tipo].idaseguradora} onChange={(e) => setPolizas((p: any) => ({ ...p, [tipo]: { ...p[tipo], idaseguradora: e.target.value } }))} onFocus={onFocus} onBlur={onBlur}>
                <option value="">Seleccionar...</option>
                {aseguradoras.map(a => <option key={a.idaseguradora} value={a.idaseguradora}>{a.nombre}</option>)}
              </select>
            </FLD>
            <FLD>
              <label style={LB}>Código póliza</label>
              <input type="text" style={IS} value={polizas[tipo].codigopoliza} onChange={(e) => setPolizas((p: any) => ({ ...p, [tipo]: { ...p[tipo], codigopoliza: e.target.value } }))} placeholder="Ej: POL-123456" onFocus={onFocus} onBlur={onBlur} />
            </FLD>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <FLD>
              <label style={LB}>Fecha vencimiento <span style={REQ}>*</span></label>
              <input type="date" style={IS} value={polizas[tipo].fechavencimiento} onChange={(e) => setPolizas((p: any) => ({ ...p, [tipo]: { ...p[tipo], fechavencimiento: e.target.value } }))} onFocus={onFocus} onBlur={onBlur} />
            </FLD>
          </div>
          <FLD>
            <label style={LB}>Archivo (imagen/PDF)</label>
            {polizas[tipo].archivo && (
              <div style={{ marginBottom: '8px', fontSize: '12px', color: '#15803d', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f0fdf4', padding: '8px', borderRadius: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span> 
                Archivo: {polizas[tipo].archivo.name}
              </div>
            )}
            <input type="file" accept="image/*,.pdf" onChange={(e) => setPolizas((p: any) => ({ ...p, [tipo]: { ...p[tipo], archivo: e.target.files?.[0] || p[tipo].archivo } }))} style={{ ...IS, paddingTop: '6px', paddingBottom: '6px', cursor: 'pointer' }} />
          </FLD>
        </div>
      ))}
    </div>
  );


  const renderPaso6 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px 16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px' }}>
        <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: '20px', marginTop: '1px' }}>info</span>
        <p style={{ margin: 0, fontSize: '13px', color: '#78350f', lineHeight: '1.5' }}>
          Busque conductores por cédula. Si no existe, podrá crearlo aquí. <strong>Mínimo 2 conductores principales requeridos.</strong>
        </p>
      </div>

      {propEsConductor && propietario && (
        <div style={{ padding: '14px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '22px' }}>person</span>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1e3a8a' }}>
              Propietario-Conductor: {propietario.nombre} {propietario.apellido} - {propietario.documento}
            </p>
            {propYaEsConductor && (
              <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '11px', backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                Ya registrado como conductor
              </span>
            )}
          </div>
        </div>
      )}

      {/* Conductores Principales */}
      {conductores.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px' }}>
            <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: '20px' }}>badge</span>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Conductores Principales:
            </h4>
          </div>
          {conductores.map((c, i) => (
            <div key={c.idusuario || c.documento} style={{ padding: '14px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 700, fontSize: '14px' }}>
                  {i + 1 + (propEsConductor ? 1 : 0)}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#166534' }}>
                    {c.nombre} {c.apellido}
                    {c.esNuevo && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                        Nuevo
                      </span>
                    )}
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#15803d' }}>Doc: {c.documento} | Lic: {c.numerolicencia} | Cat: {c.categorialicencia}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setConductores(prev => prev.filter(x => (x.idusuario || x.documento) !== (c.idusuario || c.documento)))} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span className="material-symbols-outlined" style={{ color: '#dc2626', fontSize: '20px' }}>close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Conductores de Reemplazo */}
      {conductoresReemplazo.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px' }}>
            <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '20px' }}>swap_horiz</span>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Conductores de Reemplazo:
            </h4>
          </div>
          {conductoresReemplazo.map((c, i) => (
            <div key={c.idusuario || c.documento} style={{ padding: '14px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 700, fontSize: '13px' }}>
                  R{i + 1}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1e40af' }}>
                    {c.nombre} {c.apellido}
                    {c.esNuevo && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                        Nuevo
                      </span>
                    )}
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#2563eb' }}>Doc: {c.documento} | Lic: {c.numerolicencia} | Cat: {c.categorialicencia}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setConductoresReemplazo(prev => prev.filter(x => (x.idusuario || x.documento) !== (c.idusuario || c.documento)))} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span className="material-symbols-outlined" style={{ color: '#dc2626', fontSize: '20px' }}>close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <input 
            type="text" 
            value={docConductor}
            onChange={(e) => setDocConductor(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), buscarConductor())}
            style={{ ...IS, flex: 1, padding: '12px 16px', fontSize: '14px' }}
            placeholder="Cédula del conductor al que desea asignar..."
            onFocus={onFocus} onBlur={onBlur}
          />
          <button 
            type="button" 
            onClick={buscarConductor} 
            disabled={buscandoCond}
            style={{
              padding: '0 24px', backgroundColor: '#3b82f6', color: 'white',
              borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
              border: 'none', cursor: buscandoCond ? 'not-allowed' : 'pointer', opacity: buscandoCond ? 0.6 : 1, transition: 'background 0.2s', fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => { if (!buscandoCond) e.currentTarget.style.backgroundColor = '#2563eb'; }}
            onMouseLeave={(e) => { if (!buscandoCond) e.currentTarget.style.backgroundColor = '#3b82f6'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {buscandoCond ? 'hourglass_empty' : 'person_search'}
            </span>
            Buscar
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px 12px', borderRadius: '8px', backgroundColor: esReemplazo ? '#eff6ff' : 'transparent', border: esReemplazo ? '1px solid #bfdbfe' : '1px solid transparent', transition: 'all 0.2s' }} onClick={() => setEsReemplazo(!esReemplazo)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '4px', border: esReemplazo ? 'none' : '2px solid #cbd5e1', backgroundColor: esReemplazo ? '#3b82f6' : 'transparent', transition: 'all 0.2s' }}>
            {esReemplazo && <span className="material-symbols-outlined" style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>check</span>}
          </div>
          <span style={{ fontSize: '13px', color: '#374151', fontWeight: 600, userSelect: 'none' }}>
            Marcar como conductor de reemplazo
          </span>
        </div>
      </div>

      {mostrarFormCond && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Header */}
          <div style={{ backgroundColor: '#f9fafb', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#ffffff', fontSize: '22px' }}>badge</span>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                  Licencia de Conducción
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6b7280' }}>Complete los datos obligatorios para habilitarlo como conductor</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div style={{ padding: '24px' }}>
            {/* Datos Personales */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <FLD>
                <label style={LB}>Nombre <span style={REQ}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Ej: Carlos" 
                  value={nuevoCond.nombre} 
                  onChange={(e) => setNuevoCond(p => ({ ...p, nombre: e.target.value }))} 
                  style={IS} 
                  onFocus={onFocus} 
                  onBlur={onBlur} 
                />
              </FLD>
              <FLD>
                <label style={LB}>Apellido <span style={REQ}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Ej: Rodríguez" 
                  value={nuevoCond.apellido} 
                  onChange={(e) => setNuevoCond(p => ({ ...p, apellido: e.target.value }))} 
                  style={IS} 
                  onFocus={onFocus} 
                  onBlur={onBlur} 
                />
              </FLD>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <FLD>
                <label style={LB}>Teléfono <span style={REQ}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Ej: 3001234567" 
                  value={nuevoCond.telefono} 
                  onChange={(e) => setNuevoCond(p => ({ ...p, telefono: e.target.value }))} 
                  style={IS} 
                  onFocus={onFocus} 
                  onBlur={onBlur} 
                />
              </FLD>
            </div>

            {/* Licencia de Conducción */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <FLD>
                <label style={LB}>Nº Licencia <span style={REQ}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Ej: 123456789" 
                  value={nuevoCond.numerolicencia} 
                  onChange={(e) => setNuevoCond(p => ({ ...p, numerolicencia: e.target.value }))} 
                  style={IS} 
                  onFocus={onFocus} 
                  onBlur={onBlur} 
                />
              </FLD>
              <FLD>
                <label style={LB}>Categoría <span style={REQ}>*</span></label>
                <select 
                  value={nuevoCond.categorialicencia} 
                  onChange={(e) => setNuevoCond(p => ({ ...p, categorialicencia: e.target.value }))} 
                  style={{ ...IS, cursor: 'pointer' }} 
                  onFocus={onFocus} 
                  onBlur={onBlur}
                >
                  <option value="">Seleccionar...</option>
                  {['A1','A2','B1','B2','B3','C1','C2','C3'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FLD>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <FLD>
                <label style={LB}>Fecha vencimiento <span style={REQ}>*</span></label>
                <input 
                  type="date" 
                  value={nuevoCond.fechavencimientolicencia} 
                  onChange={(e) => setNuevoCond(p => ({ ...p, fechavencimientolicencia: e.target.value }))} 
                  style={IS} 
                  onFocus={onFocus} 
                  onBlur={onBlur} 
                />
              </FLD>
            </div>

            <div>
              <label style={LB}>Archivo Escaneado <span style={REQ}>*</span></label>
              {archivoLicenciaNuevo ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: '20px' }}>check_circle</span>
                    <span style={{ fontSize: '13px', color: '#166534', fontWeight: 600 }}>{archivoLicenciaNuevo.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setArchivoLicenciaNuevo(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  >
                    <span className="material-symbols-outlined" style={{ color: '#dc2626', fontSize: '18px' }}>close</span>
                  </button>
                </div>
              ) : null}
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', border: '2px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f9fafb', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#eff6ff'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.backgroundColor = '#f9fafb'; }}>
                <span className="material-symbols-outlined" style={{ color: '#6b7280', fontSize: '24px' }}>description</span>
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>Seleccionar Archivo (PDF/IMG)</span>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(e) => setArchivoLicenciaNuevo(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px' }}>
            <button 
              type="button" 
              onClick={() => { setMostrarFormCond(false); setDocConductor(''); setEsReemplazo(false); }}
              style={{ flex: 1, padding: '10px 16px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#374151', fontSize: '13px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={agregarConductorNuevo}
              style={{ flex: 1, padding: '10px 16px', border: 'none', backgroundColor: '#3b82f6', color: '#ffffff', fontSize: '13px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontFamily: 'inherit' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span> 
              Agregar conductor
            </button>
          </div>
        </div>
      )}

      {(conductores.length + (propEsConductor ? 1 : 0)) < 2 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px' }}>
          <span className="material-symbols-outlined" style={{ color: '#dc2626', fontSize: '20px' }}>warning</span>
          <p style={{ margin: 0, fontSize: '13px', color: '#991b1b', fontWeight: 600 }}>
            Faltan {2 - conductores.length - (propEsConductor ? 1 : 0)} conductor(es) principal(es) por asignar
          </p>
        </div>
      )}
    </div>
  );

  const pasos = [renderPaso1, renderPaso2, renderPaso3, renderPaso4, renderPaso5, renderPaso6];

  if (cargandoDatos) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 32px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#0D3B8E', animation: 'spin 2s linear infinite', marginBottom: '20px' }}>progress_activity</span>
        <p style={{ fontSize: '15px', color: '#64748b', fontWeight: 500 }}>Cargando información del vehículo...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
    <div style={{
      width: '100%', maxWidth: '100%',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      border: '1px solid #f1f5f9',
      overflow: 'hidden',
    }}>
      {/* Header con título y paso actual */}
      <div style={{
        padding: '20px 32px',
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-outlined" style={{ color: '#0D3B8E', fontSize: '24px' }}>directions_bus</span>
            <h3 style={{ fontWeight: 600, color: '#1e293b', fontSize: '17px', margin: 0 }}>
              {modoEdicion ? 'Editar Vehículo' : 'Registrar Vehículo'}
            </h3>
          </div>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Paso {pasoActual + 1} de {PASOS.length}</span>
        </div>

        {/* Barra de pasos */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {PASOS.map((paso, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPasoActual(i)}
              style={{
                flex: 1, textAlign: 'center',
                padding: '8px 6px',
                fontSize: '11.5px', fontWeight: 600,
                borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
                background: i === pasoActual
                  ? '#0D3B8E'
                  : i < pasoActual
                    ? '#dcfce7'
                    : '#f1f5f9',
                color: i === pasoActual
                  ? 'white'
                  : i < pasoActual
                    ? '#15803d'
                    : '#94a3b8',
              }}
            >
              {paso}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div style={{ padding: '32px', minHeight: '320px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {pasos[pasoActual]()}
        </div>
      </div>

      {/* Footer con botones de navegación */}
      <div style={{
        padding: '16px 32px',
        borderTop: '1px solid #f1f5f9',
        backgroundColor: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          {pasoActual > 0 && (
            <button
              type="button"
              onClick={anterior}
              style={{
                padding: '9px 20px', border: '1px solid #e2e8f0',
                borderRadius: '8px', background: 'white', color: '#475569',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
              Anterior
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancelar}
            style={{
              padding: '9px 20px', border: '1px solid #e2e8f0',
              borderRadius: '8px', background: 'white', color: '#64748b',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
          >
            Cancelar
          </button>
          {pasoActual < PASOS.length - 1 ? (
            <button
              type="button"
              onClick={siguiente}
              style={{
                padding: '9px 22px', border: 'none',
                borderRadius: '8px', background: '#0D3B8E', color: 'white',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 1px 3px rgba(13,59,142,0.3)', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0A2E70')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0D3B8E')}
            >
              Siguiente
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={guardando}
              style={{
                padding: '9px 22px', border: 'none',
                borderRadius: '8px', background: '#16a34a', color: 'white',
                fontSize: '13px', fontWeight: 600, cursor: guardando ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px',
                opacity: guardando ? 0.6 : 1, transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!guardando) e.currentTarget.style.background = '#15803d'; }}
              onMouseLeave={e => (e.currentTarget.style.background = '#16a34a')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
              {guardando ? 'Guardando...' : modoEdicion ? 'Actualizar Vehículo' : 'Guardar Vehículo'}
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Success Modal */}
    {exitoModal.show && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', animation: 'fadeIn 0.3s ease' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '48px 32px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: '48px', fontWeight: 'bold' }}>check</span>
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.02em' }}>¡Registro Exitoso!</h3>
          <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.6', marginBottom: '32px' }}>{exitoModal.mensaje}</p>
          <button
            onClick={onVehiculoCreado}
            style={{ width: '100%', padding: '16px', backgroundColor: '#0D3B8E', color: 'white', borderRadius: '16px', fontSize: '15px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(13,59,142,0.3)', transition: 'transform 0.2s, background 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0A265E')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0D3B8E')}
          >
            Entendido
          </button>
        </div>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        `}</style>
      </div>
    )}
    </>
  );
}
