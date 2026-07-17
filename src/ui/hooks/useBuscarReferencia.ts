import { useState } from 'react';
import { encomiendasApi } from '../../infrastructure/services/encomiendasApi';
import { mapearEncomienda } from './useEncomiendas';
import type { EncomiendaDTO } from '../../application/dto/EncomiendaDTO';

interface BusquedaMsg {
  type: 'ok' | 'err';
  text: string;
}

/**
 * Encapsula la lógica de búsqueda de una encomienda por referencia (digitada
 * o escaneada por QR) contra GET /encomiendas/referencia/:ref.
 */
export const useBuscarReferencia = () => {
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState<BusquedaMsg | null>(null);
  const [encomiendaEncontrada, setEncomiendaEncontrada] = useState<EncomiendaDTO | null>(null);

  const buscarPorReferencia = async (valor: string) => {
    const ref = valor.trim();
    if (!ref) {
      setMensaje({ type: 'err', text: 'Ingresa o escanea una referencia.' });
      return null;
    }

    setBuscando(true);
    setMensaje(null);
    setEncomiendaEncontrada(null);

    try {
      const response = await encomiendasApi.buscarPorReferencia(ref);
      const data = response.data.data;
      const encomienda = data?.encomienda || data;

      if (!encomienda) {
        setMensaje({ type: 'err', text: 'No se encontró ninguna encomienda con esa referencia.' });
        return null;
      }

      const mapeada = mapearEncomienda(encomienda);
      setEncomiendaEncontrada(mapeada);
      setMensaje({ type: 'ok', text: 'Encomienda encontrada.' });
      return mapeada;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al buscar la referencia.';
      setMensaje({ type: 'err', text: msg });
      return null;
    } finally {
      setBuscando(false);
    }
  };

  const limpiar = () => {
    setEncomiendaEncontrada(null);
    setMensaje(null);
  };

  return {
    buscando,
    mensaje,
    encomiendaEncontrada,
    buscarPorReferencia,
    limpiar,
  };
};
