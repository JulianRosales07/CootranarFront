import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const taquillaApi = axios.create({
  baseURL: `${API_URL}/taquilla`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante: permite enviar cookies
});

// Interceptor para agregar token (por si acaso se usa token en header)
taquillaApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null' && token !== 'cookie-based-auth') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
    return taquillaApi.get('/viajes/buscar', { params });
  },

  // Obtener puntos de destino para un viaje
  obtenerPuntosDestino: (idViaje: number, idPuntoOrigen: number, idTipoBus: number, piso: number) => {
    return taquillaApi.get(`/viajes/${idViaje}/puntos-destino`, {
      params: { idPuntoOrigen, idTipoBus, piso }
    });
  },

  // Obtener punto origen del taquillero
  obtenerPuntoOrigenTaquillero: (idViaje: number) => {
    return taquillaApi.get(`/viajes/${idViaje}/punto-origen-taquillero`);
  },

  // Buscar o crear pasajero
  buscarOCrearPasajero: (data: PasajeroData) => {
    return taquillaApi.post('/pasajeros/buscar-o-crear', data);
  },

  // Confirmar venta
  confirmarVenta: (data: ConfirmarVentaData) => {
    return taquillaApi.post('/ventas/confirmar', data);
  },

  // Cancelar operación (liberar asientos reservados)
  cancelarOperacion: (data: CancelarOperacionData) => {
    return taquillaApi.post('/ventas/cancelar', data);
  },

  // Descargar PDF de tiquete (retorna una signedUrl temporal a Supabase Storage)
  descargarPdfTiquete: (idTiquete: number) => {
    return taquillaApi.get<{ success: boolean; data: { signedUrl: string } }>(`/tiquetes/${idTiquete}/pdf`);
  },

  // Abrir taquilla
  abrirTaquilla: () => {
    return taquillaApi.post('/apertura');
  },

  // Obtener tarifa de un tramo específico
  obtenerTarifaTramo: (idPuntoOrigen: number, idPuntoDestino: number, idTipoBus: number, piso: number) => {
    return taquillaApi.get('/tarifas/tramo', {
      params: { idPuntoOrigen, idPuntoDestino, idTipoBus, piso }
    });
  },

  // Obtener tiquetes de un viaje
  obtenerTiquetesViaje: (idViaje: number) => {
    return taquillaApi.get(`/viajes/${idViaje}/tiquetes`);
  },
};

export default taquillaApiService;
