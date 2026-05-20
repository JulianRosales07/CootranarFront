import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import taquillaApiService from '../../infrastructure/services/taquillaApi';
import asientosApiService from '../../infrastructure/services/asientosApi';

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
    mutationFn: (params: BuscarViajesParams) => taquillaApiService.buscarViajes(params),
  });

  // Obtener asientos de un viaje
  const obtenerAsientos = useMutation({
    mutationFn: (idViaje: number) => asientosApiService.obtenerAsientosViaje(idViaje),
  });

  // Reservar asientos
  const reservarAsientos = useMutation({
    mutationFn: (data: ReservarAsientosData) => asientosApiService.reservarAsientos(data),
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
    }) => taquillaApiService.obtenerPuntosDestino(idViaje, idPuntoOrigen, idTipoBus, piso),
  });

  // Obtener punto origen del taquillero
  const obtenerPuntoOrigen = useMutation({
    mutationFn: (idViaje: number) => taquillaApiService.obtenerPuntoOrigenTaquillero(idViaje),
  });

  // Buscar o crear pasajero
  const buscarOCrearPasajero = useMutation({
    mutationFn: (data: PasajeroData) => taquillaApiService.buscarOCrearPasajero(data),
  });

  // Confirmar venta
  const confirmarVenta = useMutation({
    mutationFn: (data: ConfirmarVentaData) => taquillaApiService.confirmarVenta(data),
    onSuccess: () => {
      // Limpiar estado después de venta exitosa
      setViajeSeleccionado(null);
      setAsientosReservados([]);
      setPasajeros([]);
    },
  });

  // Cancelar operación
  const cancelarOperacion = useMutation({
    mutationFn: (idviaje: number) => taquillaApiService.cancelarOperacion({ idviaje }),
    onSuccess: () => {
      setAsientosReservados([]);
      setPasajeros([]);
    },
  });

  // Descargar PDF
  const descargarPdf = useMutation({
    mutationFn: (idTiquete: number) => taquillaApiService.descargarPdfTiquete(idTiquete),
  });

  // Abrir taquilla
  const abrirTaquilla = useMutation({
    mutationFn: () => taquillaApiService.abrirTaquilla(),
  });

  // Obtener tarifa de un tramo
  const obtenerTarifaTramo = useMutation({
    mutationFn: ({ idPuntoOrigen, idPuntoDestino, idTipoBus, piso }: {
      idPuntoOrigen: number;
      idPuntoDestino: number;
      idTipoBus: number;
      piso: number;
    }) => taquillaApiService.obtenerTarifaTramo(idPuntoOrigen, idPuntoDestino, idTipoBus, piso),
  });

  // Obtener tiquetes de un viaje
  const obtenerTiquetesViaje = useMutation({
    mutationFn: (idViaje: number) => taquillaApiService.obtenerTiquetesViaje(idViaje),
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
