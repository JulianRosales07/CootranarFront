import type { TarifaEncomienda } from '../entities/TarifaEncomienda';

export interface TarifaEncomiendaRepository {
  listar(params?: Record<string, any>): Promise<{ tarifas: TarifaEncomienda[]; paginacion?: any }>;
  crear(datos: { idOficinaOrigen: number; idOficinaDestino: number; valorBase: number }): Promise<TarifaEncomienda>;
  actualizar(id: number, datos: { valorBase: number; idOficinaOrigen?: number; idOficinaDestino?: number }): Promise<TarifaEncomienda>;
}
