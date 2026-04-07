import type { TarifaRutaRepository } from '../../domain/repositories/TarifaRutaRepository';
import type { TarifaRuta } from '../../domain/entities/TarifaRuta';
import { httpClient } from '../api/httpClient';

function mapFromBackend(raw: any): TarifaRuta {
  return {
    id: String(raw.idtarifaruta ?? raw.id),
    idRuta: String(raw.idruta ?? raw.idRuta ?? ''),
    idTipoBus: String(raw.idtipobus ?? raw.idTipoBus ?? ''),
    piso: Number(raw.piso ?? 1),
    valorNormal: Number(raw.valornormal ?? raw.valorNormal ?? 0),
    valorTraficoAlto: Number(raw.valortraficoalto ?? raw.valorTraficoAlto ?? 0),
    adicionalPoltrona: raw.adicionalpoltrona !== undefined ? Number(raw.adicionalpoltrona) : 0,
    activo: raw.activo ?? true,
    rutaNombre: raw.nombreruta ?? raw.rutaNombre,
    tipoBusNombre: raw.nombretipobus ?? raw.tipoBusNombre,
  };
}

export class ApiTarifaRutaRepository implements TarifaRutaRepository {
  async obtenerTodas(): Promise<TarifaRuta[]> {
    const response = await httpClient.get('/tarifas-ruta');
    const data = response.data.data;
    const tarifasArray = data.tarifas || data || [];
    return tarifasArray.map(mapFromBackend);
  }

  async obtenerPorRuta(idRuta: string): Promise<TarifaRuta[]> {
    const response = await httpClient.get(`/tarifas-ruta/ruta/${idRuta}`);
    const data = response.data.data;
    const tarifasArray = data.tarifas || data || [];
    return tarifasArray.map(mapFromBackend);
  }

  async obtenerPorId(id: string): Promise<TarifaRuta> {
    const response = await httpClient.get(`/tarifas-ruta/${id}`);
    return mapFromBackend(response.data.data);
  }

  async crear(data: Partial<TarifaRuta>): Promise<TarifaRuta> {
    const response = await httpClient.post('/tarifas-ruta', data);
    return mapFromBackend(response.data.data);
  }

  async actualizar(id: string, data: Partial<TarifaRuta>): Promise<TarifaRuta> {
    const response = await httpClient.put(`/tarifas-ruta/${id}`, data);
    return mapFromBackend(response.data.data);
  }

  async eliminar(id: string): Promise<void> {
    await httpClient.delete(`/tarifas-ruta/${id}`);
  }
}
