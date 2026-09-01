import type {
  TaquillaRepository,
  BuscarViajesParams,
  PasajeroData,
  ConfirmarVentaData,
  CancelarOperacionData,
} from '../../domain/repositories/TaquillaRepository';
import { httpClient } from '../api/httpClient';

export class ApiTaquillaRepository implements TaquillaRepository {
  async buscarViajes(params: BuscarViajesParams): Promise<any> {
    return httpClient.get('/taquilla/viajes/buscar', { params });
  }

  async obtenerPuntosDestino(idViaje: number, idPuntoOrigen: number, idTipoBus: number, piso: number): Promise<any> {
    return httpClient.get(`/taquilla/viajes/${idViaje}/puntos-destino`, {
      params: { idPuntoOrigen, idTipoBus, piso },
    });
  }

  async obtenerPuntoOrigenTaquillero(idViaje: number): Promise<any> {
    return httpClient.get(`/taquilla/viajes/${idViaje}/punto-origen-taquillero`);
  }

  async buscarOCrearPasajero(data: PasajeroData): Promise<any> {
    return httpClient.post('/taquilla/pasajeros/buscar-o-crear', data);
  }

  async confirmarVenta(data: ConfirmarVentaData): Promise<any> {
    return httpClient.post('/taquilla/ventas/confirmar', data);
  }

  async cancelarOperacion(data: CancelarOperacionData): Promise<any> {
    return httpClient.post('/taquilla/ventas/cancelar', data);
  }

  async descargarPdfTiquete(idTiquete: number): Promise<any> {
    return httpClient.get(`/taquilla/tiquetes/${idTiquete}/pdf`);
  }

  async abrirTaquilla(): Promise<any> {
    return httpClient.post('/taquilla/apertura');
  }

  async obtenerTarifaTramo(idPuntoOrigen: number, idPuntoDestino: number, idTipoBus: number, piso: number): Promise<any> {
    return httpClient.get('/taquilla/tarifas/tramo', {
      params: { idPuntoOrigen, idPuntoDestino, idTipoBus, piso },
    });
  }

  async obtenerTiquetesViaje(idViaje: number): Promise<any> {
    return httpClient.get(`/taquilla/viajes/${idViaje}/tiquetes`);
  }
}

export const apiTaquillaRepository = new ApiTaquillaRepository();
