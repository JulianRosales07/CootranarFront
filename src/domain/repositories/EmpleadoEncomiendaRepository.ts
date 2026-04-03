import type { EmpleadoEncomienda } from '../entities/EmpleadoEncomienda';

export interface EmpleadoEncomiendaRepository {
  findActivos(): Promise<EmpleadoEncomienda[]>;
  buscar(busqueda: string): Promise<EmpleadoEncomienda[]>;
  buscarPorDocumento(documento: string): Promise<EmpleadoEncomienda | null>;
  save(data: Omit<EmpleadoEncomienda, 'id'>): Promise<EmpleadoEncomienda>;
  update(id: string, data: Partial<EmpleadoEncomienda>): Promise<EmpleadoEncomienda>;
}
