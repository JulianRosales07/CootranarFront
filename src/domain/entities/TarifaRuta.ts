export interface TarifaRuta {
  id: string;
  idRuta: string;
  idTipoBus: string;
  piso: number;
  valorNormal: number;
  valorTraficoAlto: number;
  adicionalPoltrona?: number;
  activo?: boolean;
  rutaNombre?: string;
  tipoBusNombre?: string;
}
