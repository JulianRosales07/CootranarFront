import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Layout } from '../../components/layout/Layout';
import { SeleccionTramo } from '../../components/taquilla/SeleccionTramo';
import { BuscadorViajes } from '../../components/taquilla/BuscadorViajes';
import { ListaViajes } from '../../components/taquilla/ListaViajes';
import { VisualizadorAsientos } from '../../components/taquilla/VisualizadorAsientos';
import { FormularioPasajeros } from '../../components/taquilla/FormularioPasajeros';
import { ResumenVenta } from '../../components/taquilla/ResumenVenta';
import { TiquetesGenerados } from '../../components/taquilla/TiquetesGenerados';
import { SelectorGrupo } from '../../components/taquilla/SelectorGrupo';
import { IndicadorProgresoPasajero } from '../../components/taquilla/IndicadorProgresoPasajero';
import { useTaquilla } from '../../hooks/useTaquilla';
import { useAsientosRealtime } from '../../hooks/useAsientosRealtime';
import metodosPagoApiService from '../../../infrastructure/services/metodosPagoApi';
import taquillaApiService from '../../../infrastructure/services/taquillaApi';
import asientosApiService from '../../../infrastructure/services/asientosApi';

// ── Paleta MD3 ────────────────────────────────────────────────────────────────
const C = {
  primary:             '#00355f',
  primaryContainer:    '#0f4c81',
  secondary:           '#0058be',
  secondaryFixed:      '#d8e2ff',
  surface:             '#f8f9ff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainerLowest: '#ffffff',
  outlineVariant:      '#c2c7d1',
  onSurface:           '#0b1c30',
  onSurfaceVariant:    '#42474f',
};

const FONT = "'Hanken Grotesk', 'Plus Jakarta Sans', sans-serif";

type Paso = 'busqueda' | 'configurar-grupo' | 'seleccion-tramo' | 'seleccion-asiento-pasajero' | 'seleccion-asientos' | 'datos-pasajeros' | 'resumen' | 'completado';

interface ConfigPasajero {
  tipoPasajero: 'adulto' | 'nino';
  tramo?: { origen: number; destino: number; precio: number; tarifaCompleta?: any };
  idasientoviaje?: number;
  numeroAsiento?: number;
}

interface AsientoConDatos {
  idasientoviaje: number;
  numero: number;
  piso: number;
  espoltrona: boolean;
  estado: 'LIBRE' | 'RESERVADO' | 'VENDIDO';
  fila: number;
  columna: number;
  pasajero?: any;
  puntoOrigen?: any;
  puntoDestino?: any;
  precio?: number;
}

// ── Estadísticas estáticas ─────────────────────────────────────────────────────
const STATS = [
  { icon: 'directions_bus',  label: 'Rutas Activas',  value: '124 Operaciones' },
  { icon: 'group',           label: 'Pasajeros Hoy',  value: '842 Reservas'    },
  { icon: 'monetization_on', label: 'Recaudo Total',  value: '$12.4M COP'      },
];

// ── Helper: formatea hora HH:MM a 12h ─────────────────────────────────────────
const fmtHora = (h: string) => {
  if (!h) return '—';
  const [hh, mm] = String(h).split(':').map(Number);
  const p = hh >= 12 ? 'p.m.' : 'a.m.';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${p}`;
};


export const TaquillaPage = () => {
  const [pasoActual, setPasoActual] = useState<Paso>('busqueda');
  const [viajes, setViajes] = useState<any[]>([]);
  const [asientos, setAsientos] = useState<any[]>([]);
  const [asientosConDatos, setAsientosConDatos] = useState<AsientoConDatos[]>([]);
  const [metodosPago, setMetodosPago] = useState<any[]>([]);
  const [tiquetesGenerados, setTiquetesGenerados] = useState<any[]>([]);
  const [puntoOrigenTaquillero, setPuntoOrigenTaquillero] = useState<number | null>(null);
  const [puntoDestinoFinal, setPuntoDestinoFinal] = useState<number | null>(null);
  const [puntosRuta, setPuntosRuta] = useState<any[]>([]);
  const [tramoSeleccionado, setTramoSeleccionado] = useState<{ origen: number; destino: number; precio: number; tarifaCompleta?: any } | null>(null);

  // ── Multi-tiquete ──────────────────────────────────────────────────────────
  const [configuracionGrupo, setConfiguracionGrupo] = useState<{ adultos: number; ninos: number } | null>(null);
  const [configPasajeros, setConfigPasajeros] = useState<ConfigPasajero[]>([]);
  const [pasajeroActualIdx, setPasajeroActualIdx] = useState(0);
  const [asientosYaSeleccionadosGrupo, setAsientosYaSeleccionadosGrupo] = useState<number[]>([]);

  // ── Viajes sugeridos (cargados desde el backend) ───────────────────────
  const [viajesSugeridos, setViajesSugeridos] = useState<any[]>([]);
  const [cargandoSugeridos, setCargandoSugeridos] = useState(false);

  const {
    viajeSeleccionado, setViajeSeleccionado,
    asientosReservados, setAsientosReservados,
    buscarViajes, obtenerAsientos, reservarAsientos,
    obtenerPuntoOrigen, buscarOCrearPasajero,
    confirmarVenta, cancelarOperacion, descargarPdf, obtenerTarifaTramo,
  } = useTaquilla();

  // ── Ref para asientos pendientes de confirmación Realtime ────────────────
  const asientosPendientesRef = useRef<Set<number>>(new Set());

  // ── Realtime: actualizar asientos cuando cambian externamente ──────────
  useAsientosRealtime(
    viajeSeleccionado?.idviaje ?? null,
    useCallback((idasientoviaje: number, nuevoEstado: 'LIBRE' | 'RESERVADO' | 'VENDIDO') => {
      // Si el asiento está en "pendientes" (yo lo acabo de reservar, esperando confirmación Realtime)
      if (asientosPendientesRef.current.has(idasientoviaje) && nuevoEstado === 'RESERVADO') {
        // Realtime confirmó MI reserva — ahora sí pintarlo como seleccionado (verde)
        asientosPendientesRef.current.delete(idasientoviaje);
        setAsientosReservados(prev => prev.includes(idasientoviaje) ? prev : [...prev, idasientoviaje]);
        // No actualizar el estado del asiento en el array — el VisualizadorAsientos
        // lo pintará verde porque está en asientosReservados (asientosSeleccionados prop)
        return;
      }

      // Si el asiento es MÍO (ya confirmado en mis reservados)
      setAsientosReservados(prev => {
        const esMio = prev.includes(idasientoviaje);
        if (esMio) {
          if (nuevoEstado === 'VENDIDO') {
            // Conflicto: alguien más lo vendió — quitarlo
            setAsientos(prevA => prevA.map(a =>
              a.idasientoviaje === idasientoviaje ? { ...a, estado: nuevoEstado } : a
            ));
            return prev.filter(id => id !== idasientoviaje);
          }
          if (nuevoEstado === 'LIBRE') {
            // Fue liberado externamente — quitarlo de mis reservados
            setAsientos(prevA => prevA.map(a =>
              a.idasientoviaje === idasientoviaje ? { ...a, estado: nuevoEstado } : a
            ));
            return prev.filter(id => id !== idasientoviaje);
          }
          // RESERVADO para mi propio asiento — no hacer nada
          return prev;
        }
        // No es mío — actualizar normalmente el mapa de asientos
        setAsientos(prevA => prevA.map(a =>
          a.idasientoviaje === idasientoviaje ? { ...a, estado: nuevoEstado } : a
        ));
        return prev;
      });
    }, [])
  );

  // ── Safety-net: liberar asientos si el componente se desmonta inesperadamente
  // (cierre de pestaña, navegación del navegador, etc.)
  useEffect(() => {
    return () => {
      // Solo ejecutar si hay asientos reservados sin completar la venta
      if (viajeSeleccionado && asientosReservados.length) {
        // Usamos el servicio directamente (no mutation) porque el componente ya se desmonta
        import('../../../infrastructure/services/taquillaApi').then(({ default: svc }) => {
          svc.cancelarOperacion({ idviaje: viajeSeleccionado.idviaje }).catch(() => {});
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    cargarMetodosPago();
    cargarViajesSugeridos();
  }, []);

  const cargarMetodosPago = async () => {
    try {
      const res = await metodosPagoApiService.obtenerActivos();
      setMetodosPago(res.data.data.metodosPago || []);
    } catch (err) { console.error('Error cargando métodos de pago:', err); }
  };

  const cargarViajesSugeridos = useCallback(async () => {
    setCargandoSugeridos(true);
    try {
      // Llamamos directamente al servicio para evitar problemas con el closure de la mutación
      const res = await taquillaApiService.buscarViajes({});
      const todos: any[] = res.data.data.viajes || [];
      // Mostrar hasta 6 viajes con asientos libres
      const disponibles = todos
        .filter(v => v.asientoslibres > 0)
        .slice(0, 6);
      setViajesSugeridos(disponibles);
    } catch (err) {
      console.warn('No se pudieron cargar viajes sugeridos:', err);
      setViajesSugeridos([]);
    } finally {
      setCargandoSugeridos(false);
    }
  }, []);

  // ── Paso 1 ────────────────────────────────────────────────────────────────
  const handleBuscarViajes = async (params: any) => {
    try {
      const res = await buscarViajes.mutateAsync(params);
      setViajes(res.data.data.viajes || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al buscar viajes');
    }
  };

  // ── Paso 2 ────────────────────────────────────────────────────────────────
  const handleSeleccionarViaje = async (viaje: any) => {
    try {
      console.log('🚌 [handleSeleccionarViaje] Viaje seleccionado:', viaje);
      setViajeSeleccionado(viaje);
      const resAsientos = await obtenerAsientos.mutateAsync(viaje.idviaje);
      const asientosData = resAsientos.data?.data?.asientos || resAsientos.data?.asientos || [];
      if (!asientosData.length) { alert('Este viaje no tiene asientos configurados.'); return; }
      setAsientos(asientosData);

      // Obtener puntos de la ruta (origen y destino)
      try {
        const resPuntos = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/rutas/${viaje.idruta}/puntos`, { withCredentials: true });
        const pts = resPuntos.data?.data?.puntos;
        console.log('📍 Puntos de la ruta:', pts);
        
        if (pts && pts.length > 0) {
          setPuntosRuta(pts); // Guardar todos los puntos
          const puntoDestino = pts[pts.length - 1].idpuntoruta;
          setPuntoDestinoFinal(puntoDestino);
          console.log('✅ Punto destino final:', puntoDestino);
        }
      } catch (error) {
        console.error('❌ Error obteniendo puntos de la ruta:', error);
      }

      // Obtener punto origen del taquillero
      try {
        const res = await obtenerPuntoOrigen.mutateAsync(viaje.idviaje);
        const puntoOrigen = res.data.data.idPuntoOrigen;
        setPuntoOrigenTaquillero(puntoOrigen);
        console.log('✅ Punto origen taquillero:', puntoOrigen);
      } catch (error) {
        console.error('❌ Error obteniendo punto origen taquillero:', error);
        // Si falla, usar el primer punto de la ruta como fallback
        try {
          const resPuntos = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/rutas/${viaje.idruta}/puntos`, { withCredentials: true });
          const pts = resPuntos.data?.data?.puntos;
          if (pts && pts.length > 0) {
            const puntoOrigen = pts[0].idpuntoruta;
            setPuntoOrigenTaquillero(puntoOrigen);
            console.log('✅ Punto origen (fallback):', puntoOrigen);
          }
        } catch (err) {
          console.error('❌ Error obteniendo puntos como fallback:', err);
          setPuntoOrigenTaquillero(null);
        }
      }
      
      setPasoActual('configurar-grupo');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al procesar el viaje');
    }
  };

  // ── Paso 2b: Configurar Grupo ─────────────────────────────────────────────
  const handleConfigurarGrupo = (adultos: number, ninos: number) => {
    setConfiguracionGrupo({ adultos, ninos });
    const pasajeros: ConfigPasajero[] = [
      ...Array(adultos).fill(null).map(() => ({ tipoPasajero: 'adulto' as const })),
      ...Array(ninos).fill(null).map(() => ({ tipoPasajero: 'nino' as const })),
    ];
    setConfigPasajeros(pasajeros);
    setPasajeroActualIdx(0);
    setAsientosYaSeleccionadosGrupo([]);
    setAsientosReservados([]);
    setPasoActual('seleccion-tramo');
  };

  // ── Paso 2.5: Selección de Tramo (por pasajero) ───────────────────────────
  const handleSeleccionarTramo = (puntoOrigen: number, puntoDestino: number, precio: number, tarifaCompleta?: any) => {
    // Multi-tiquete: guardar el tramo del pasajero actual
    if (configuracionGrupo && configPasajeros.length > 1) {
      setConfigPasajeros(prev => prev.map((p, i) =>
        i === pasajeroActualIdx ? { ...p, tramo: { origen: puntoOrigen, destino: puntoDestino, precio, tarifaCompleta } } : p
      ));
      setTramoSeleccionado({ origen: puntoOrigen, destino: puntoDestino, precio, tarifaCompleta });
      setAsientosReservados([]);
      setPasoActual('seleccion-asiento-pasajero');
    } else {
      // Flujo original (1 pasajero)
      setTramoSeleccionado({ origen: puntoOrigen, destino: puntoDestino, precio, tarifaCompleta });
      setPasoActual('seleccion-asientos');
    }
  };

  const handleConsultarTarifa = async (puntoOrigen: number, puntoDestino: number, piso: number) => {
    return await obtenerTarifaTramo.mutateAsync({
      idPuntoOrigen: puntoOrigen,
      idPuntoDestino: puntoDestino,
      idTipoBus: viajeSeleccionado.idtipobus,
      piso
    });
  };

  // ── Paso 3 ────────────────────────────────────────────────────────────────
  const [reservandoAsiento, setReservandoAsiento] = useState<number | null>(null);

  const handleToggleAsiento = async (id: number) => {
    if (reservandoAsiento) return; // Evitar doble clic mientras procesa
    setReservandoAsiento(id);
    try {
      if (asientosReservados.includes(id)) {
        // Liberar — el backend actualiza BD → Realtime notifica a todos al mismo tiempo
        await asientosApiService.liberarAsientos(viajeSeleccionado.idviaje, [id]);
        // NO quitar localmente — Realtime enviará LIBRE y el callback lo quitará
        setAsientosReservados(prev => prev.filter(x => x !== id));
      } else {
        // Reservar — marcar como pendiente, NO pintar aún
        asientosPendientesRef.current.add(id);
        await asientosApiService.reservarAsientos({ idviaje: viajeSeleccionado.idviaje, asientos: [id] });
        // NO agregar a asientosReservados aquí — Realtime confirmará y el callback lo pintará
        // Así taquilla y plataforma ecommerce pintan al mismo tiempo (cuando Realtime llega)
      }
    } catch (err: any) {
      // Si falló, quitar de pendientes
      asientosPendientesRef.current.delete(id);
      console.error('[Taquilla] Error al reservar/liberar asiento:', err);
    } finally {
      setReservandoAsiento(null);
    }
  };

  // ── Paso 4 ────────────────────────────────────────────────────────────────
  const handleContinuarAPasajeros = async () => {
    if (!asientosReservados.length) { alert('Seleccione al menos un asiento'); return; }
    try {
      await reservarAsientos.mutateAsync({ idviaje: viajeSeleccionado.idviaje, asientos: asientosReservados });
      
      const basePrice = Number(tramoSeleccionado?.precio || 50000);
      const adicPoltrona = Number(tramoSeleccionado?.tarifaCompleta?.adicionalPoltrona || 20000);
      
      const puntoOrigenSeleccionado = tramoSeleccionado?.origen;
      const puntoDestinoSeleccionado = tramoSeleccionado?.destino;
      
      const sel = asientos
        .filter(a => asientosReservados.includes(a.idasientoviaje))
        .map((a) => {
          const p = a.espoltrona ? basePrice + adicPoltrona : basePrice;
          // Si es multi-tiquete, cada asiento tiene su propio tramo
          const cfgPasajero = configuracionGrupo && configPasajeros.length > 1
            ? configPasajeros.find(cp => cp.idasientoviaje === a.idasientoviaje)
            : null;
          const tramoFinal = cfgPasajero?.tramo || { origen: puntoOrigenSeleccionado!, destino: puntoDestinoSeleccionado! };
          const pOrigenObj = puntosRuta.find(pt => pt.idpuntoruta === tramoFinal.origen);
          const pDestinoObj = puntosRuta.find(pt => pt.idpuntoruta === tramoFinal.destino);
          return { 
            ...a,
            numero: a.numeroasiento, // Mapear numeroasiento a numero
            pasajero: undefined, 
            puntoOrigen: { idpuntoruta: tramoFinal.origen, nombre: pOrigenObj?.nombre }, 
            puntoDestino: { idpuntoruta: tramoFinal.destino, nombre: pDestinoObj?.nombre }, 
            precio: p,
            tipoPasajero: cfgPasajero?.tipoPasajero || 'adulto',
          };
        });
      setAsientosConDatos(sel);
      setPasoActual('datos-pasajeros');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al reservar asientos');
    }
  };

  // ── Paso asiento-por-pasajero (multi-tiquete) ────────────────────────────
  const handleAsientoSeleccionadoPasajero = async () => {
    if (!asientosReservados.length) { alert('Seleccione un asiento'); return; }
    const idAsientoSeleccionado = asientosReservados[asientosReservados.length - 1];
    const seatData = asientos.find(a => a.idasientoviaje === idAsientoSeleccionado);

    try {
      await reservarAsientos.mutateAsync({ idviaje: viajeSeleccionado.idviaje, asientos: [idAsientoSeleccionado] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al reservar asiento');
      return;
    }

    // Guardar el asiento en la config del pasajero actual
    setConfigPasajeros(prev => prev.map((p, i) =>
      i === pasajeroActualIdx ? { ...p, idasientoviaje: idAsientoSeleccionado, numeroAsiento: seatData?.numeroasiento } : p
    ));
    setAsientosYaSeleccionadosGrupo(prev => [...prev, idAsientoSeleccionado]);

    const siguiente = pasajeroActualIdx + 1;
    if (siguiente < configPasajeros.length) {
      // Hay más pasajeros → siguiente pasajero elige tramo y asiento
      setPasajeroActualIdx(siguiente);
      setAsientosReservados([]);
      setTramoSeleccionado(null);
      setPasoActual('seleccion-tramo');
    } else {
      // Último pasajero → armar asientosConDatos y pasar a datos-pasajeros
      const updatedConfig = configPasajeros.map((p, i) =>
        i === pasajeroActualIdx ? { ...p, idasientoviaje: idAsientoSeleccionado, numeroAsiento: seatData?.numeroasiento } : p
      );

      const sel = updatedConfig.map(cp => {
        const seatRaw = asientos.find(a => a.idasientoviaje === cp.idasientoviaje);
        const base = Number(cp.tramo?.precio || 50000);
        const adPol = Number(cp.tramo?.tarifaCompleta?.adicionalPoltrona || 20000);
        const precio = seatRaw?.espoltrona ? base + adPol : base;
        const pOrigenObj = puntosRuta.find(pt => pt.idpuntoruta === cp.tramo?.origen);
        const pDestinoObj = puntosRuta.find(pt => pt.idpuntoruta === cp.tramo?.destino);
        return {
          ...seatRaw,
          numero: seatRaw?.numeroasiento, // Mapear numeroasiento a numero
          pasajero: undefined,
          puntoOrigen: { idpuntoruta: cp.tramo?.origen, nombre: pOrigenObj?.nombre },
          puntoDestino: { idpuntoruta: cp.tramo?.destino, nombre: pDestinoObj?.nombre },
          precio,
          tipoPasajero: cp.tipoPasajero,
        };
      });
      setAsientosConDatos(sel);
      setPasoActual('datos-pasajeros');
    }
  };

  // ── Paso 5 ────────────────────────────────────────────────────────────────
  const handleBuscarPasajero = async (documento: string) => {
    try {
      const res = await taquillaApiService.buscarOCrearPasajero({ tipodocumento: 'CC', documento, nombre: '', apellido: '' });
      return res.data.data.usuario;
    } catch { return null; }
  };

  // ── Paso 6 ────────────────────────────────────────────────────────────────
  const handleAsignarPasajero = async (idAsiento: number, pasajero: any) => {
    const res = await buscarOCrearPasajero.mutateAsync(pasajero);
    const pasajeroCreado = res.data.data.usuario;
    
    // CRÍTICO: Usar SIEMPRE el tramo seleccionado
    const puntoOrigenSeleccionado = tramoSeleccionado?.origen;
    const puntoDestinoSeleccionado = tramoSeleccionado?.destino;
    
    // El precio ya fue calculado e inicializado correctamente en handleContinuarAPasajeros
    // Solo lo recuperamos del estado actual de asientosConDatos
    const asientoConDatosActual = asientosConDatos.find(a => a.idasientoviaje === idAsiento);
    const precioCalculado = asientoConDatosActual?.precio || tramoSeleccionado?.precio || 50000;
    
    // Obtener nombres de los puntos
    const puntoOrigenObj = puntosRuta.find(p => p.idpuntoruta === puntoOrigenSeleccionado);
    const puntoDestinoObj = puntosRuta.find(p => p.idpuntoruta === puntoDestinoSeleccionado);
    
    console.log('💾 Guardando asiento con datos:', {
      precio: precioCalculado,
      puntoOrigen: puntoOrigenObj?.nombre,
      puntoDestino: puntoDestinoObj?.nombre
    });
    
    setAsientosConDatos(prev => prev.map(a =>
      a.idasientoviaje === idAsiento
        ? { 
            ...a, 
            pasajero: pasajeroCreado, 
            precio: precioCalculado,
            puntoOrigen: { idpuntoruta: puntoOrigenSeleccionado, nombre: puntoOrigenObj?.nombre },
            puntoDestino: { idpuntoruta: puntoDestinoSeleccionado, nombre: puntoDestinoObj?.nombre }
          }
        : a
    ));
  };

  // ── Paso 7 ────────────────────────────────────────────────────────────────
  const handleContinuarAResumen = () => {
    if (!asientosConDatos.every(a => a.pasajero)) { alert('Complete los datos de todos los pasajeros'); return; }
    setPasoActual('resumen');
  };

  // ── Paso 8 ────────────────────────────────────────────────────────────────
  const handleConfirmarVenta = async (metodoPago: number, formaPago: 'CONTADO' | 'CREDITO') => {
    try {
      const asientosVenta = asientosConDatos.map(a => ({
        idAsientoViaje: a.idasientoviaje,
        idUsuarioPasajero: a.pasajero.idusuario,
        idPuntoOrigen: a.puntoOrigen?.idpuntoruta || puntoOrigenTaquillero,
        idPuntoDestino: a.puntoDestino?.idpuntoruta || puntoDestinoFinal,
        valorCobrado: a.precio || 50000,
      }));
      const res = await confirmarVenta.mutateAsync({ idViaje: viajeSeleccionado.idviaje, idMetodoPago: metodoPago, formaPago, asientos: asientosVenta });
      setTiquetesGenerados(res.data?.tiquetes || res.data?.data?.tiquetes || []);
      setPasoActual('completado');
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || err.message || 'Error al confirmar la venta'}`);
    }
  };

  // ── Liberar asientos y refrescar la vista del mapa ───────────────────────
  const liberarAsientosYRefrescar = async () => {
    if (viajeSeleccionado && asientosReservados.length) {
      try { await cancelarOperacion.mutateAsync(viajeSeleccionado.idviaje); } catch {}
    }
    // Refrescar lista de asientos para que el mapa quede actualizado
    if (viajeSeleccionado) {
      try {
        const resAsientos = await obtenerAsientos.mutateAsync(viajeSeleccionado.idviaje);
        const asientosData = resAsientos.data?.data?.asientos || resAsientos.data?.asientos || [];
        if (asientosData.length) setAsientos(asientosData);
      } catch { /* silencioso: el mapa igual se mostrará */ }
    }
    setAsientosReservados([]);
    setAsientosConDatos([]);
  };

  // ── Cancelar / Nueva venta ────────────────────────────────────────────────
  const handleCancelar = async () => {
    await liberarAsientosYRefrescar();
    handleNuevaVenta();
  };

  const handleNuevaVenta = () => {
    setViajeSeleccionado(null);
    setViajes([]); setAsientos([]); setAsientosConDatos([]);
    setAsientosReservados([]); setTiquetesGenerados([]);
    setPuntoOrigenTaquillero(null); 
    setPuntoDestinoFinal(null);
    setPuntosRuta([]);
    setTramoSeleccionado(null);
    setConfiguracionGrupo(null);
    setConfigPasajeros([]);
    setPasajeroActualIdx(0);
    setAsientosYaSeleccionadosGrupo([]);
    setPasoActual('busqueda');
  };

  // ── PDF ───────────────────────────────────────────────────────────────────
  const handleDescargarPdf = async (idTiquete: number, intentos = 0) => {
    try {
      const res = await descargarPdf.mutateAsync(idTiquete);
      const url = res.data?.data?.signedUrl || res.data?.signedUrl;
      if (!url) {
        if (intentos < 2) { await new Promise(r => setTimeout(r, 2000)); return handleDescargarPdf(idTiquete, intentos + 1); }
        alert('El PDF aún se está generando. Intente nuevamente.'); return;
      }
      window.open(url, '_blank');
    } catch (err: any) {
      if (err.response?.status === 404 && intentos < 2) {
        await new Promise(r => setTimeout(r, 2000)); return handleDescargarPdf(idTiquete, intentos + 1);
      }
      alert(err.response?.status === 404 ? 'PDF aún generándose.' : err.response?.data?.message || 'Error al descargar.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  /** Breadcrumb superior */
  const renderBreadcrumb = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: C.onSurfaceVariant, marginBottom: '4px', fontFamily: FONT }}>
      <span>Operaciones</span>
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
      <span style={{ color: C.primary, fontWeight: '700' }}>Taquilla</span>
      {viajeSeleccionado && (
        <>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span style={{ color: C.primary, fontWeight: '700' }}>{viajeSeleccionado.ciudadorigen} – {viajeSeleccionado.ciudaddestino}</span>
        </>
      )}
    </div>
  );

  /** Botón cancelar proceso */
  const renderCancelBtn = () =>
    pasoActual !== 'busqueda' && pasoActual !== 'completado' ? (
      <button
        onClick={handleCancelar}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
          background: '#fff1f2', border: '1px solid #fecdd3',
          color: '#e11d48', fontSize: '12px', fontWeight: '700',
          fontFamily: FONT, transition: 'all 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#ffe4e6'}
        onMouseLeave={e => e.currentTarget.style.background = '#fff1f2'}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
        Cancelar Proceso
      </button>
    ) : null;

  /** Stats cards – solo se muestran en paso busqueda */
  const renderStats = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      {STATS.map(s => (
        <div key={s.label} style={{
          background: C.surfaceContainerLow, borderRadius: '12px',
          border: `1px solid ${C.outlineVariant}`, padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: '16px', fontFamily: FONT,
        }}>
          <div style={{ width: '48px', height: '48px', background: C.secondaryFixed, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{s.icon}</span>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: C.onSurfaceVariant, fontWeight: '500', margin: 0 }}>{s.label}</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: C.primary, margin: 0, lineHeight: 1.2 }}>{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );

  /** Viajes sugeridos – cargados desde el backend */
  const renderRutasSugeridas = () => (
    <div style={{ fontFamily: FONT }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '22px', fontWeight: '700', color: C.onSurface, margin: 0 }}>Viajes Sugeridos</h3>
        <button
          onClick={cargarViajesSugeridos}
          style={{ fontSize: '13px', color: C.secondary, fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
          Actualizar
        </button>
      </div>

      {/* Loading */}
      {cargandoSugeridos && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${C.outlineVariant}`, padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', opacity: 0.5 }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: C.surfaceContainerLow, flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ height: '12px', background: C.surfaceContainerLow, borderRadius: '6px', width: '60%' }} />
                <div style={{ height: '18px', background: C.surfaceContainerLow, borderRadius: '6px', width: '80%' }} />
                <div style={{ height: '12px', background: C.surfaceContainerLow, borderRadius: '6px', width: '50%' }} />
              </div>
            </div>
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
        </div>
      )}

      {/* Sin datos */}
      {!cargandoSugeridos && viajesSugeridos.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: `1px solid ${C.outlineVariant}`, color: C.onSurfaceVariant, fontFamily: FONT }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: C.outlineVariant, display: 'block', marginBottom: '8px' }}>directions_bus</span>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>No hay viajes disponibles en este momento</p>
          <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Usa el buscador para consultar rutas específicas</p>
        </div>
      )}

      {/* Cards con datos reales */}
      {!cargandoSugeridos && viajesSugeridos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {viajesSugeridos.map((v) => {
            const disponible = v.asientoslibres > 0;
            const pct = Math.round(((v.totalasientos - v.asientoslibres) / v.totalasientos) * 100);
            const barColor = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#22c55e';
            return (
              <div
                key={v.idviaje}
                onClick={() => handleSeleccionarViaje(v)}
                style={{
                  background: '#fff', borderRadius: '12px', border: `1px solid ${C.outlineVariant}`,
                  padding: '16px', display: 'flex', alignItems: 'center', gap: '14px',
                  cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,53,95,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Ícono de bus */}
                <div style={{ width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: `${C.primaryContainer}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '38px', color: C.primaryContainer }}>directions_bus</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '999px', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase',
                      background: disponible ? C.secondaryFixed : '#ffdad6',
                      color: disponible ? C.secondary : '#ba1a1a',
                    }}>
                      {disponible ? 'DISPONIBLE' : 'AGOTADO'}
                    </span>
                    <span style={{ fontSize: '11px', color: C.onSurfaceVariant }}>
                      {v.asientoslibres} libres
                    </span>
                  </div>

                  {/* Ruta */}
                  <p style={{ fontSize: '15px', fontWeight: '700', color: C.onSurface, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {v.ciudadorigen} → {v.ciudaddestino}
                  </p>

                  {/* Hora + Móvil */}
                  <p style={{ fontSize: '12px', color: C.onSurfaceVariant, margin: '0 0 6px' }}>
                    Salida: {fmtHora(v.horasalida)} · Móvil {v.numeromovil}
                  </p>

                  {/* Barra ocupación */}
                  <div style={{ width: '100%', height: '3px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '999px', transition: 'width 0.5s' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Layout hideHeader={pasoActual === 'completado'}>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      {pasoActual !== 'completado' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontFamily: FONT }}>
          <div>
            {renderBreadcrumb()}
            <h1 style={{ fontSize: '42px', fontWeight: '800', color: C.primary, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {pasoActual === 'busqueda'           && 'Buscador de Viajes'}
              {pasoActual === 'seleccion-tramo'    && 'Selección de Tramo'}
              {pasoActual === 'seleccion-asientos' && 'Selección de Asientos'}
              {pasoActual === 'datos-pasajeros'    && 'Datos de Pasajeros'}
              {pasoActual === 'resumen'             && 'Resumen de Pago'}
            </h1>
            <p style={{ fontSize: '15px', color: C.onSurfaceVariant, marginTop: '6px', fontWeight: '500' }}>
              {pasoActual === 'busqueda'            && 'Gestione las rutas y disponibilidad en tiempo real para el sistema COOTRANAR.'}
              {pasoActual === 'seleccion-tramo'     && 'Selecciona el origen y destino del pasajero para ver el precio del tramo.'}
              {pasoActual === 'seleccion-asientos'  && 'Selecciona los asientos disponibles para tu viaje.'}
              {pasoActual === 'datos-pasajeros'     && 'Completa los datos de cada pasajero asignado.'}
              {pasoActual === 'resumen'              && 'Verifica la información antes de confirmar el pago.'}
            </p>
          </div>
          {renderCancelBtn()}
        </div>
      )}

      {/* ── Paso: Búsqueda ───────────────────────────────────────────────── */}
      {pasoActual === 'busqueda' && (
        <>
          <BuscadorViajes
            pasoActual={pasoActual}
            onBuscar={handleBuscarViajes}
            cargando={buscarViajes.isPending}
          />

          {viajes.length > 0 ? (
            <ListaViajes
              viajes={viajes}
              onSeleccionar={handleSeleccionarViaje}
              cargando={obtenerAsientos.isPending}
            />
          ) : (
            <>
              {renderStats()}
              {renderRutasSugeridas()}
            </>
          )}
        </>
      )}

      {/* ── Paso: Configurar Grupo ─────────────────────────────────────── */}
      {pasoActual === 'configurar-grupo' && viajeSeleccionado && (
        <SelectorGrupo
          viaje={viajeSeleccionado}
          asientosLibres={viajeSeleccionado.asientoslibres || 40}
          onConfirmar={handleConfigurarGrupo}
          onVolver={() => setPasoActual('busqueda')}
        />
      )}

      {/* ── Paso: Selección de Tramo ────────────────────────────────────── */}
      {pasoActual === 'seleccion-tramo' && viajeSeleccionado && (
        <>
          {configuracionGrupo && configPasajeros.length > 1 && (
            <IndicadorProgresoPasajero
              pasajeros={configPasajeros}
              indiceActual={pasajeroActualIdx}
              subfase="tramo"
            />
          )}
          <SeleccionTramo
            viaje={viajeSeleccionado}
            puntosRuta={puntosRuta}
            puntoOrigenDefault={puntoOrigenTaquillero || undefined}
            puntoDestinoDefault={puntoDestinoFinal || undefined}
            onContinuar={handleSeleccionarTramo}
            onVolver={() => configuracionGrupo ? setPasoActual('configurar-grupo') : setPasoActual('busqueda')}
            onConsultarTarifa={handleConsultarTarifa}
            pasajeroIdx={configuracionGrupo && configPasajeros.length > 1 ? pasajeroActualIdx : undefined}
            totalPasajeros={configPasajeros.length}
            tipoPasajero={configPasajeros[pasajeroActualIdx]?.tipoPasajero}
          />
        </>
      )}

      {/* ── Paso: Asiento individual por pasajero (multi-tiquete) ─────────── */}
      {pasoActual === 'seleccion-asiento-pasajero' && viajeSeleccionado && (
        <>
          <IndicadorProgresoPasajero
            pasajeros={configPasajeros}
            indiceActual={pasajeroActualIdx}
            subfase="asiento"
          />
          <VisualizadorAsientos
            viaje={viajeSeleccionado}
            asientos={asientos}
            asientosSeleccionados={asientosReservados}
            onSeleccionar={(id) => setAsientosReservados([id])}
            onContinuar={handleAsientoSeleccionadoPasajero}
            onCancelar={async () => {
              // Si ya había asientos reservados para pasajeros anteriores del grupo,
              // hay que liberarlos antes de volver a selección de tramo
              if (asientosYaSeleccionadosGrupo.length > 0 || asientosReservados.length > 0) {
                await liberarAsientosYRefrescar();
                setAsientosYaSeleccionadosGrupo([]);
                setConfigPasajeros(prev => prev.map(p => ({ ...p, idasientoviaje: undefined, numeroAsiento: undefined })));
                setPasajeroActualIdx(0);
              }
              setPasoActual('seleccion-tramo');
            }}
            cargando={reservarAsientos.isPending}
            precioBase={tramoSeleccionado?.precio}
            adicionalPoltrona={tramoSeleccionado?.tarifaCompleta?.adicionalPoltrona}
            asientosYaSeleccionados={asientosYaSeleccionadosGrupo}
            pasajeroIdx={pasajeroActualIdx}
            totalPasajeros={configPasajeros.length}
            tipoPasajero={configPasajeros[pasajeroActualIdx]?.tipoPasajero}
            modoSingleSeleccion={true}
          />
        </>
      )}

      {/* ── Paso: Asientos (flujo original 1 pasajero) ─────────────────── */}
      {pasoActual === 'seleccion-asientos' && viajeSeleccionado && (
        <VisualizadorAsientos
          viaje={viajeSeleccionado}
          asientos={asientos}
          asientosSeleccionados={asientosReservados}
          onSeleccionar={handleToggleAsiento}
          onContinuar={handleContinuarAPasajeros}
          onCancelar={() => setPasoActual('seleccion-tramo')}
          cargando={reservarAsientos.isPending}
          precioBase={tramoSeleccionado?.precio}
          adicionalPoltrona={tramoSeleccionado?.tarifaCompleta?.adicionalPoltrona}
        />
      )}

      {/* ── Paso: Pasajeros ─────────────────────────────────────────────── */}
      {pasoActual === 'datos-pasajeros' && (
        <FormularioPasajeros
          asientos={asientosConDatos}
          viaje={viajeSeleccionado}
          onBuscarPasajero={handleBuscarPasajero}
          onAsignarPasajero={handleAsignarPasajero}
          onContinuar={handleContinuarAResumen}
          onVolver={async () => {
            // ¡CRÍTICO! Liberar los asientos reservados en el backend antes de volver.
            // Sin esto, los asientos quedan bloqueados y nadie más puede comprarlos.
            await liberarAsientosYRefrescar();
            // Para el flujo grupal, volver al selector de asiento del primer pasajero
            if (configuracionGrupo && configPasajeros.length > 1) {
              setAsientosYaSeleccionadosGrupo([]);
              setConfigPasajeros(prev => prev.map(p => ({ ...p, idasientoviaje: undefined, numeroAsiento: undefined })));
              setPasajeroActualIdx(0);
              setTramoSeleccionado(null);
              setPasoActual('seleccion-tramo');
            } else {
              setPasoActual('seleccion-asientos');
            }
          }}
          cargando={buscarOCrearPasajero.isPending}
        />
      )}

      {/* ── Paso: Resumen ────────────────────────────────────────────────── */}
      {pasoActual === 'resumen' && (
        <ResumenVenta
          viaje={viajeSeleccionado}
          asientos={asientosConDatos as any}
          onConfirmar={handleConfirmarVenta}
          onVolver={() => setPasoActual('datos-pasajeros')}
          cargando={confirmarVenta.isPending}
          metodosPago={metodosPago}
          configuracionGrupo={configuracionGrupo}
        />
      )}

      {/* ── Paso: Completado ─────────────────────────────────────────────── */}
      {pasoActual === 'completado' && (
        <TiquetesGenerados
          tiquetes={tiquetesGenerados}
          onDescargarPdf={handleDescargarPdf}
          onNuevaVenta={handleNuevaVenta}
          viaje={viajeSeleccionado}
        />
      )}
    </Layout>
  );
};
