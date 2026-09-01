import type { Viaje } from '../entities/Viaje';

export interface ViajeRepository {
  // Generic CRUD (existing)
  findById(id: string): Promise<Viaje | null>;
  findAll(): Promise<Viaje[]>;
  save(viaje: Omit<Viaje, 'id' | 'createdAt' | 'updatedAt'>): Promise<Viaje>;
  update(id: string, data: Partial<Viaje>): Promise<Viaje>;
  delete(id: string): Promise<void>;

  // Domain-specific methods (Sprint 4)
  obtenerTodos(params?: any): Promise<any>;
  obtenerActivos(params?: any): Promise<any>;
  obtenerInactivos(params?: any): Promise<any>;
  buscar(busqueda: string, params?: any): Promise<any>;
  obtenerPorId(idviaje: string | number): Promise<any>;
  obtenerDatosVehiculo(numeromovil: string | number): Promise<any>;
  crear(data: any): Promise<any>;
  actualizar(idviaje: string | number, data: any): Promise<any>;
  activar(idviaje: string | number): Promise<any>;
  desactivar(idviaje: string | number): Promise<any>;
}
