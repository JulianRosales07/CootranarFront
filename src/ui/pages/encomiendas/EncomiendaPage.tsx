import { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useEncomiendas, consultarEncomiendaPorId } from '../../hooks/useEncomiendas';
import { useBuscarReferencia } from '../../hooks/useBuscarReferencia';
import { useMiOficinaEncomienda } from '../../hooks/useMiOficinaEncomienda';
import { BuscadorReferencia } from '../../components/encomiendas/BuscadorReferencia';
import { TablaEncomiendas } from '../../components/encomiendas/TablaEncomiendas';
import { RegistroEncomiendaModal } from '../../components/encomiendas/RegistroEncomiendaModal';
import { AccionEncomiendaModal } from '../../components/encomiendas/AccionEncomiendaModal';
import { ComprobanteEncomiendaModal } from '../../components/encomiendas/ComprobanteEncomiendaModal';
import { DetalleEncomiendaModal } from '../../components/encomiendas/DetalleEncomiendaModal';
import type { EncomiendaDTO } from '../../../application/dto/EncomiendaDTO';

const BLUE = '#0D3B8E';
const ITEMS_PER_PAGE = 10;

export const EncomiendaPage = () => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [page, setPage] = useState(1);

  const { encomiendas, paginacion, isLoading, cambiarEstado, registrarConPreinscripcion, registrarDirecta, eliminar } =
    useEncomiendas({ estado: filtroEstado, busqueda, page, limit: ITEMS_PER_PAGE });
  const { idOficinaOrigen } = useMiOficinaEncomienda();
  const { buscando, mensaje, encomiendaEncontrada, buscarPorReferencia, limpiar } = useBuscarReferencia();

  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [preinscripcionParaRegistro, setPreinscripcionParaRegistro] = useState<EncomiendaDTO | null>(null);
  const [comprobante, setComprobante] = useState<any | null>(null);

  const [accionModal, setAccionModal] = useState<{ tipo: 'ENTREGAR' | 'DEVOLVER'; encomienda: EncomiendaDTO } | null>(null);
  const [accionError, setAccionError] = useState<string | null>(null);

  const [detalle, setDetalle] = useState<EncomiendaDTO | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  const abrirRegistroConPreinscripcion = (enc: EncomiendaDTO) => {
    setPreinscripcionParaRegistro(enc);
    setModalRegistroAbierto(true);
  };

  const abrirRegistroDirecto = () => {
    setPreinscripcionParaRegistro(null);
    setModalRegistroAbierto(true);
  };

  const cerrarModalRegistro = () => {
    setModalRegistroAbierto(false);
    setPreinscripcionParaRegistro(null);
  };

  const handleRegistrarConPreinscripcion = (data: Record<string, unknown>) => {
    registrarConPreinscripcion.mutate(data, {
      onSuccess: (resultado: any) => {
        cerrarModalRegistro();
        limpiar();
        setComprobante(resultado?.comprobantePdf || null);
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || err?.message || 'Error al registrar la encomienda.');
      },
    });
  };

  const handleRegistrarDirecta = (data: Record<string, unknown>) => {
    registrarDirecta.mutate(data, {
      onSuccess: (resultado: any) => {
        cerrarModalRegistro();
        setComprobante(resultado?.comprobantePdf || null);
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || err?.message || 'Error al registrar la encomienda.');
      },
    });
  };

  const handleConfirmarRecepcion = (enc: EncomiendaDTO) => {
    cambiarEstado.mutate({ id: enc.id, accion: 'CONFIRMAR_RECEPCION' }, {
      onError: (err: any) => {
        alert(err?.response?.data?.message || err?.message || 'Error al confirmar la recepción.');
      },
    });
  };

  const handleAbrirEntregar = (enc: EncomiendaDTO) => setAccionModal({ tipo: 'ENTREGAR', encomienda: enc });
  const handleAbrirDevolver = (enc: EncomiendaDTO) => setAccionModal({ tipo: 'DEVOLVER', encomienda: enc });

  const handleVer = async (enc: EncomiendaDTO) => {
    setModalDetalleAbierto(true);
    setCargandoDetalle(true);
    try {
      const completa = await consultarEncomiendaPorId(enc.id);
      setDetalle(completa || enc);
    } catch {
      setDetalle(enc);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const handleCerrarDetalle = () => {
    setModalDetalleAbierto(false);
    setDetalle(null);
  };

  const handleEliminar = (enc: EncomiendaDTO) => {
    if (!window.confirm(`¿Eliminar la preinscripción con referencia ${enc.referencia}? Esta acción no se puede revertir.`)) return;
    eliminar.mutate(enc.id, {
      onError: (err: any) => {
        alert(err?.response?.data?.message || err?.message || 'Error al eliminar la encomienda.');
      },
    });
  };

  const handleConfirmarAccion = (datos: { documentoRecibe?: string; nombreRecibe?: string; observaciones?: string }) => {
    if (!accionModal) return;
    setAccionError(null);
    cambiarEstado.mutate(
      {
        id: accionModal.encomienda.id,
        accion: accionModal.tipo === 'ENTREGAR' ? 'ENTREGAR' : 'DEVOLVER',
        ...datos,
      },
      {
        onSuccess: () => setAccionModal(null),
        onError: (err: any) => {
          setAccionError(err?.response?.data?.message || err?.message || 'Error al procesar la acción.');
        },
      }
    );
  };

  return (
    <Layout>
      <BuscadorReferencia
        buscando={buscando}
        mensaje={mensaje}
        encomiendaEncontrada={encomiendaEncontrada}
        onBuscar={buscarPorReferencia}
        onSeleccionar={abrirRegistroConPreinscripcion}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={abrirRegistroDirecto}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: BLUE, color: 'white', border: 'none', borderRadius: '7px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_box</span>
          Registrar Encomienda Directa
        </button>
      </div>

      <TablaEncomiendas
        encomiendas={encomiendas}
        isLoading={isLoading}
        busqueda={busqueda}
        onBusquedaChange={(v) => { setBusqueda(v); setPage(1); }}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={(v) => { setFiltroEstado(v); setPage(1); }}
        page={page}
        onPageChange={setPage}
        totalPaginas={paginacion?.totalPaginas || 1}
        totalRegistros={paginacion?.total || 0}
        idOficinaEmpleado={idOficinaOrigen}
        onVer={handleVer}
        onEliminar={handleEliminar}
        onConfirmarRecepcion={handleConfirmarRecepcion}
        onEntregar={handleAbrirEntregar}
        onDevolver={handleAbrirDevolver}
      />

      <RegistroEncomiendaModal
        isOpen={modalRegistroAbierto}
        onClose={cerrarModalRegistro}
        preinscripcion={preinscripcionParaRegistro}
        idOficinaOrigen={idOficinaOrigen}
        cargando={registrarConPreinscripcion.isPending || registrarDirecta.isPending}
        onRegistrarConPreinscripcion={handleRegistrarConPreinscripcion}
        onRegistrarDirecta={handleRegistrarDirecta}
      />

      <AccionEncomiendaModal
        isOpen={!!accionModal}
        onClose={() => { setAccionModal(null); setAccionError(null); }}
        tipo={accionModal?.tipo ?? null}
        referencia={accionModal?.encomienda.referencia}
        cargando={cambiarEstado.isPending}
        onConfirmar={handleConfirmarAccion}
      />
      {accionError && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, zIndex: 80 }}>
          {accionError}
        </div>
      )}

      <ComprobanteEncomiendaModal comprobante={comprobante} onClose={() => setComprobante(null)} />

      {modalDetalleAbierto && (
        <DetalleEncomiendaModal encomienda={detalle} cargando={cargandoDetalle} onClose={handleCerrarDetalle} />
      )}
    </Layout>
  );
};
