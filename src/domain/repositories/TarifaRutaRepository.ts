import type { TarifaRuta } from '../entities/TarifaRuta';

export interface TarifaRutaRepository {
  obtenerTodas(): Promise<TarifaRuta[]>;
  obtenerPorRuta(idRuta: string): Promise<TarifaRuta[]>;
  obtenerPorId(id: string): Promise<TarifaRuta>;
  crear(data: Partial<TarifaRuta>): Promise<TarifaRuta>;
  actualizar(id: string, data: Partial<TarifaRuta>): Promise<TarifaRuta>;
  eliminar(id: string): Promise<void>;
  // Aliases used by use-cases
  save(data: Partial<TarifaRuta> | Omit<TarifaRuta, 'id'>): Promise<TarifaRuta>;
  delete(id: string): Promise<void>;
  findByRuta(idRuta: string): Promise<TarifaRuta[]>;
  update(id: string, data: Partial<TarifaRuta>): Promise<TarifaRuta>;
}
