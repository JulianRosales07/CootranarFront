export interface MetodoPagoRepository {
  obtenerTodos(): Promise<any>;
  obtenerActivos(): Promise<any>;
}
