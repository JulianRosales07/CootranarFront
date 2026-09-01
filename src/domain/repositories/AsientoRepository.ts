export interface ReservarAsientosData {
  idviaje: number;
  asientos: number[];
}

export interface AsientoRepository {
  obtenerAsientosViaje(idViaje: number): Promise<any>;
  reservarAsientos(data: ReservarAsientosData): Promise<any>;
  liberarAsientos(idViaje: number, asientos: number[]): Promise<any>;
}
