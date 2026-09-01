export interface ConfiguracionSistemaRepository {
  obtenerEstadoPrecioGlobal(): Promise<any>;
  cambiarEstadoPrecioGlobal(estado: string): Promise<any>;
}
