export interface TarifaEncomienda {
  idTarifa: number;
  idOficinaOrigen: number;
  idOficinaDestino: number;
  valorBase: number;
  activo: boolean;
  fechaActualizacion?: string;
  nombreOficinaOrigen?: string;
  nombreOficinaDestino?: string;
}
