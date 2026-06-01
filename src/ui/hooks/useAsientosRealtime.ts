import { useEffect, useRef } from 'react';
import { supabase } from '../../infrastructure/supabase/supabaseClient';

type EstadoAsiento = 'LIBRE' | 'RESERVADO' | 'VENDIDO';

export function useAsientosRealtime(
  idViaje: number | null,
  onCambio: (idasientoviaje: number, nuevoEstado: EstadoAsiento) => void
) {
  const onCambioRef = useRef(onCambio);

  useEffect(() => {
    onCambioRef.current = onCambio;
  });

  useEffect(() => {
    if (!idViaje) return;

    console.log(`[Realtime] Creando canal para viaje ${idViaje}`);

    const channel = supabase
      .channel(`taquilla-asientos-viaje-${idViaje}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'asientoviaje',
          filter: `idviaje=eq.${idViaje}`
        },
        (payload: any) => {
          const { new: nuevo } = payload;
          if (!nuevo) return;

          const id: number = nuevo.idasientoviaje;
          const estadoBD: string = nuevo.estado;

          // Mapear estado de BD a estado local
          let estado: EstadoAsiento;
          if (estadoBD === 'RESERVADO') {
            estado = 'RESERVADO';
          } else if (estadoBD === 'LIBRE') {
            estado = 'LIBRE';
          } else {
            estado = 'VENDIDO';
          }

          onCambioRef.current(id, estado);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tiquete',
          filter: `idviaje=eq.${idViaje}`
        },
        (payload: any) => {
          const { new: nuevo } = payload;
          if (!nuevo) return;

          const idasientoviaje: number = nuevo.idasientoviaje;
          onCambioRef.current(idasientoviaje, 'VENDIDO');
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Canal taquilla viaje ${idViaje}: ${status}`);
      });

    return () => {
      console.log(`[Realtime] Eliminando canal para viaje ${idViaje}`);
      supabase.removeChannel(channel);
    };
  }, [idViaje]);
}
