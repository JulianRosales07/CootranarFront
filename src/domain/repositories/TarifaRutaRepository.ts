import type { TarifaRuta } from '../entities/TarifaRuta';

export interface TarifaRutaRepository {
  findByRuta(idRuta: string): Promise<TarifaRuta[]>;
  findByRutaYTipoBus(idRuta: string, idTipoBus: string): Promise<TarifaRuta | null>;
  save(data: Omit<TarifaRuta, 'id'>): Promise<TarifaRuta>;
  update(id: string, data: Partial<TarifaRuta>): Promise<TarifaRuta>;
  delete(id: string): Promise<void>;
}
