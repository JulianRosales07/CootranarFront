export interface Ciudad {
  id: string;
  nombre: string;
  departamento: string;
  codigo: string;
  codigoDane: string | null;
  urlImagenCiudad: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
