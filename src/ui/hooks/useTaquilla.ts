import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiTaquillaRepository } from '../../infrastructure/repositories/ApiTaquillaRepository';
import { apiAsientoRepository } from '../../infrastructure/repositories/ApiAsientoRepository';

interface BuscarViajesParams {
  ciudadorigen?: string;
  ciudaddestino?: string;
  fecha?: string;
  numerotiquete?: string;
  page?: number;
  limit?: number;
}

interface PasajeroData {
  tipodocumento: string;
  documento: string;
  nombre: string;
  apellido: string;
  correo?: string;
  telefono?: string;
}

interface AsientoVenta {
  idAsientoViaje: number;
  idUsuarioPasajero: number;
  idPuntoOrigen: number;
  idPuntoDestino?: number | null;
  valorCobrado: number;
}

interface ConfirmarVentaData {
  idViaje: number;
  idMetodoPago: number;
  formaPago: 'CONTADO' | 'CREDITO';
  asientos: AsientoVenta[];
}

interface ReservarAsientosData {
  idviaje: number;
  asientos: number[];
}

export const useTaquilla = () => {
  const [viajeSeleccionado, setViajeSeleccionado] = useState<any>(null);
  const [asientosReservados, setAsientosReservados] = useState<number[]>([]);
  const [pasajeros, setPasajeros] = useState<any[]>([]);

  // Buscar viajes
  const buscarViajes = useMutation({
    mutationFn: (params: BuscarViajesParams) => apiTaquillaRepository.buscarViajes(params),
  });

  // Obtener asientos de un viaje
  const obtenerAsientos = useMutation({
    mutationFn: (idViaje: number) => apiAsientoRepository.obtenerAsientosViaje(idViaje),
  });

  // Reservar asientos
  const reservarAsientos = useMutation({
    mutationFn: (data: ReservarAsientosData) => apiAsientoRepository.reservarAsientos(data),
    onSuccess: (_, variables) => {
      setAsientosReservados(variables.asientos);
    },
  });

  // Obtener puntos de destino
  const obtenerPuntosDestino = useMutation({
    mutationFn: ({ idViaje, idPuntoOrigen, idTipoBus, piso }: {
      idViaje: number;
      idPuntoOrigen: number;
      idTipoBus: number;
      piso: number;
    }) => apiTaquillaRepository.obtenerPuntosDestino(idViaje, idPuntoOrigen, idTipoBus, piso),
  });

  // Obtener punto origen del taquillero
  const obtenerPuntoOrigen = useMutation({
    mutationFn: (idViaje: number) => apiTaquillaRepository.obtenerPuntoOrigenTaquillero(idViaje),
  });

  // Buscar o crear pasajero
  const buscarOCrearPasajero = useMutation({
    mutationFn: (data: PasajeroData) => apiTaquillaRepository.buscarOCrearPasajero(data),
  });

  // Confirmar venta
  const confirmarVenta = useMutation({
    mutationFn: (data: ConfirmarVentaData) => apiTaquillaRepository.confirmarVenta(data),
    onSuccess: () => {
      // Limpiar estado después de venta exitosa
      setViajeSeleccionado(null);
      setAsientosReservados([]);
      setPasajeros([]);
    },
  });

  // Cancelar operación
  const cancelarOperacion = useMutation({
    mutationFn: (idviaje: number) => apiTaquillaRepository.cancelarOperacion({ idviaje }),
    onSuccess: () => {
      setAsientosReservados([]);
      setPasajeros([]);
    },
  });

  // Descargar PDF
  const descargarPdf = useMutation({
    mutationFn: (idTiquete: number) => apiTaquillaRepository.descargarPdfTiquete(idTiquete),
  });

  // Abrir taquilla
  const abrirTaquilla = useMutation({
    mutationFn: () => apiTaquillaRepository.abrirTaquilla(),
  });

  // Obtener tarifa de un tramo
  const obtenerTarifaTramo = useMutation({
    mutationFn: ({ idPuntoOrigen, idPuntoDestino, idTipoBus, piso }: {
      idPuntoOrigen: number;
      idPuntoDestino: number;
      idTipoBus: number;
      piso: number;
    }) => apiTaquillaRepository.obtenerTarifaTramo(idPuntoOrigen, idPuntoDestino, idTipoBus, piso),
  });

  // Obtener tiquetes de un viaje
  const obtenerTiquetesViaje = useMutation({
    mutationFn: (idViaje: number) => apiTaquillaRepository.obtenerTiquetesViaje(idViaje),
  });

  return {
    // Estado
    viajeSeleccionado,
    setViajeSeleccionado,
    asientosReservados,
    setAsientosReservados,
    pasajeros,
    setPasajeros,

    // Mutaciones
    buscarViajes,
    obtenerAsientos,
    reservarAsientos,
    obtenerPuntosDestino,
    obtenerPuntoOrigen,
    buscarOCrearPasajero,
    confirmarVenta,
    cancelarOperacion,
    descargarPdf,
    abrirTaquilla,
    obtenerTarifaTramo,
    obtenerTiquetesViaje,
  };
};
