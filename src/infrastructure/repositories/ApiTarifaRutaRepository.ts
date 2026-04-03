import type { TarifaRutaRepository } from '../../domain/repositories/TarifaRutaRepository';
import type { TarifaRuta } from '../../domain/entities/TarifaRuta';
import { httpClient } from '../api/httpClient';

function mapFromBackend(raw: any): TarifaRuta {
  return {
    id: String(raw.idtarifaruta ?? raw.id),
    idRuta: String(raw.idruta ?? raw.idRuta ?? ''),
    idTipoBus: String(raw.idtipobus ?? raw.idTipoBus ?? ''),
    precio: Number(raw.precio ?? raw.valor ?? 0),
    rutaNombre: raw.ruta_nombre ?? raw.rutaNombre ?? '',
    tipoBusNombre: raw.tipobus_nombre ?? raw.tipoBusNombre ?? '',
  };
}

function mapToBackend(data: Partial<TarifaRuta>) {
  const payload: any = {};
  if (data.idRuta !== undefined) payload.idruta = Number(data.idRuta) || data.idRuta;
  if (data.idTipoBus !== undefined) payload.idtipobus = Number(data.idTipoBus) || data.idTipoBus;
  if (data.precio !== undefined) payload.precio = data.precio;
  return payload;
}

export class ApiTarifaRutaRepository implements TarifaRutaRepository {
  async findByRuta(idRuta: string): Promise<TarifaRuta[]> {
    const response = await httpClient.get(`/tarifas-ruta/ruta/${idRuta}`);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data.map(mapFromBackend) : [];
  }

  async findByRutaYTipoBus(idRuta: string, idTipoBus: string): Promise<TarifaRuta | null> {
    try {
      const response = await httpClient.get(`/tarifas-ruta/ruta/${idRuta}/tipobus/${idTipoBus}`);
      const raw = response.data?.data ?? response.data;
      return mapFromBackend(raw);
    } catch {
      return null;
    }
  }

  async save(data: Omit<TarifaRuta, 'id'>): Promise<TarifaRuta> {
    const response = await httpClient.post('/tarifas-ruta', mapToBackend(data));
    const raw = response.data?.data ?? response.data;
    return mapFromBackend(raw);
  }

  async update(id: string, data: Partial<TarifaRuta>): Promise<TarifaRuta> {
    const response = await httpClient.put(`/tarifas-ruta/${id}`, mapToBackend(data));
    const raw = response.data?.data ?? response.data;
    return mapFromBackend(raw);
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/tarifas-ruta/${id}`);
  }
}
