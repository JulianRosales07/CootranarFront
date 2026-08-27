import type { TarifaEncomiendaRepository } from '../../domain/repositories/TarifaEncomiendaRepository';
import type { TarifaEncomienda } from '../../domain/entities/TarifaEncomienda';
import { tarifasEncomiendasApi } from '../services/tarifasEncomiendasApi';

function mapFromBackend(raw: any): TarifaEncomienda {
  return {
    idTarifa: Number(raw.idTarifa ?? raw.idtarifa ?? raw.id),
    idOficinaOrigen: Number(raw.idOficinaOrigen ?? raw.idoficinaorigen),
    idOficinaDestino: Number(raw.idOficinaDestino ?? raw.idoficinadestino),
    valorBase: Number(raw.valorBase ?? raw.valorbase ?? 0),
    activo: raw.activo ?? true,
    fechaActualizacion: raw.fechaActualizacion ?? raw.fechaactualizacion ?? raw.updatedAt,
    nombreOficinaOrigen: raw.nombreOficinaOrigen ?? raw.nombreoficinaorigen ?? '',
    nombreOficinaDestino: raw.nombreOficinaDestino ?? raw.nombreoficinadestino ?? '',
  };
}

export class ApiTarifaEncomiendaRepository implements TarifaEncomiendaRepository {
  async listar(params: Record<string, any> = {}): Promise<{ tarifas: TarifaEncomienda[]; paginacion?: any }> {
    const response = await tarifasEncomiendasApi.listar(params);
    const resData = response.data?.data ?? response.data ?? {};
    const rawList = resData.tarifas ?? (Array.isArray(resData) ? resData : []);
    return {
      tarifas: rawList.map(mapFromBackend),
      paginacion: resData.paginacion,
    };
  }

  async crear(datos: { idOficinaOrigen: number; idOficinaDestino: number; valorBase: number }): Promise<TarifaEncomienda> {
    const response = await tarifasEncomiendasApi.crear(datos);
    const raw = response.data?.data?.tarifa ?? response.data?.data ?? response.data;
    return mapFromBackend(raw);
  }

  async actualizar(id: number, datos: { valorBase: number; idOficinaOrigen?: number; idOficinaDestino?: number }): Promise<TarifaEncomienda> {
    const response = await tarifasEncomiendasApi.actualizar(id, datos);
    const raw = response.data?.data?.tarifa ?? response.data?.data ?? response.data;
    return mapFromBackend(raw);
  }
}
