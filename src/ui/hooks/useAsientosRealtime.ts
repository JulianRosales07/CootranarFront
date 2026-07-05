import { useEffect, useRef } from 'react';
import { supabase } from '../../infrastructure/supabase/supabaseClient';

type EstadoAsiento = 'LIBRE' | 'RESERVADO' | 'VENDIDO';

export function useAsientosRealtime(
  idViaje: number | null,
  onCambio: (idasientoviaje: number, nuevoEstado: EstadoAsiento) => void,
  onReconectar?: () => void
) {
  const onCambioRef = useRef(onCambio);
  const onReconectarRef = useRef(onReconectar);
  // Evitar disparar onReconectar en la suscripción inicial
  const suscritoRef = useRef(false);

  useEffect(() => { onCambioRef.current = onCambio; });
  useEffect(() => { onReconectarRef.current = onReconectar; });

  useEffect(() => {
    if (!idViaje) return;

    suscritoRef.current = false;
    console.log(`[Realtime] Creando canal para viaje ${idViaje}`);

    const channel = supabase
      .channel(`taquilla-asientos-viaje-${idViaje}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'asientoviaje', filter: `idviaje=eq.${idViaje}` },
        (payload: any) => {
          const { new: nuevo } = payload;
          if (!nuevo) return;
          const id: number = nuevo.idasientoviaje;
          const estadoBD: string = nuevo.estado;
          let estado: EstadoAsiento;
          if (estadoBD === 'RESERVADO') estado = 'RESERVADO';
          else if (estadoBD === 'LIBRE') estado = 'LIBRE';
          else estado = 'VENDIDO';
          onCambioRef.current(id, estado);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tiquete', filter: `idviaje=eq.${idViaje}` },
        (payload: any) => {
          const { new: nuevo } = payload;
          if (!nuevo) return;
          const idasientoviaje: number = nuevo.idasientoviaje;
          onCambioRef.current(idasientoviaje, 'VENDIDO');
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Canal taquilla viaje ${idViaje}: ${status}`);
        if (status === 'SUBSCRIBED') {
          if (suscritoRef.current) {
            // Reconexión real — jitter 200-800ms para distribuir requests si hay muchos usuarios
            const jitter = 200 + Math.random() * 600;
            console.log(`[Realtime] Reconexión detectada para viaje ${idViaje}, refrescando en ${Math.round(jitter)}ms`);
            setTimeout(() => onReconectarRef.current?.(), jitter);
          }
          suscritoRef.current = true;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          suscritoRef.current = false;
        }
      });

    return () => {
      console.log(`[Realtime] Eliminando canal para viaje ${idViaje}`);
      supabase.removeChannel(channel);
    };
  }, [idViaje]);
}
