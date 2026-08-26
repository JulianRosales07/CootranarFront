import { httpClient } from '../api/httpClient';

export interface BuscarViajesParams {
  ciudadorigen?: string;
  ciudaddestino?: string;
  fecha?: string;
  numerotiquete?: string;
  page?: number;
  limit?: number;
}

export interface PasajeroData {
  tipodocumento: string;
  documento: string;
  nombre: string;
  apellido: string;
  correo?: string;
  telefono?: string;
}

export interface AsientoVenta {
  idAsientoViaje: number;
  idUsuarioPasajero: number;
  idPuntoOrigen: number;
  idPuntoDestino?: number | null;
  valorCobrado: number;
}

export interface ConfirmarVentaData {
  idViaje: number;
  idMetodoPago: number;
  formaPago: 'CONTADO' | 'CREDITO';
  asientos: AsientoVenta[];
}

export interface CancelarOperacionData {
  idviaje: number;
}

export const taquillaApiService = {
  // Buscar viajes disponibles
  buscarViajes: (params: BuscarViajesParams) => {
    return httpClient.get('/taquilla/viajes/buscar', { params });
  },

  // Obtener puntos de destino para un viaje
  obtenerPuntosDestino: (idViaje: number, idPuntoOrigen: number, idTipoBus: number, piso: number) => {
    return httpClient.get(`/taquilla/viajes/${idViaje}/puntos-destino`, {
      params: { idPuntoOrigen, idTipoBus, piso }
    });
  },

  // Obtener punto origen del taquillero
  obtenerPuntoOrigenTaquillero: (idViaje: number) => {
    return httpClient.get(`/taquilla/viajes/${idViaje}/punto-origen-taquillero`);
  },

  // Buscar o crear pasajero
  buscarOCrearPasajero: (data: PasajeroData) => {
    return httpClient.post('/taquilla/pasajeros/buscar-o-crear', data);
  },

  // Confirmar venta
  confirmarVenta: (data: ConfirmarVentaData) => {
    return httpClient.post('/taquilla/ventas/confirmar', data);
  },

  // Cancelar operación (liberar asientos reservados)
  cancelarOperacion: (data: CancelarOperacionData) => {
    return httpClient.post('/taquilla/ventas/cancelar', data);
  },

  // Descargar PDF de tiquete (retorna una signedUrl temporal a Supabase Storage)
  descargarPdfTiquete: (idTiquete: number) => {
    return httpClient.get<{ success: boolean; data: { signedUrl: string } }>(`/taquilla/tiquetes/${idTiquete}/pdf`);
  },

  // Abrir taquilla
  abrirTaquilla: () => {
    return httpClient.post('/taquilla/apertura');
  },

  // Obtener tarifa de un tramo específico
  obtenerTarifaTramo: (idPuntoOrigen: number, idPuntoDestino: number, idTipoBus: number, piso: number) => {
    return httpClient.get('/taquilla/tarifas/tramo', {
      params: { idPuntoOrigen, idPuntoDestino, idTipoBus, piso }
    });
  },

  // Obtener tiquetes de un viaje
  obtenerTiquetesViaje: (idViaje: number) => {
    return httpClient.get(`/taquilla/viajes/${idViaje}/tiquetes`);
  },
};

export default taquillaApiService;
