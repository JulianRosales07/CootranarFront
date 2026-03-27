export type EstadoConductor = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';

export interface Conductor {
  id: string;
  idusuario?: number; // ID numérico del backend
  nombre: string;
  apellido: string;
  documento: string;
  tipoDocumento?: string;
  licencia: string;
  categoriaLicencia?: string;
  vencimientoLicencia?: string;
  telefono: string;
  email?: string;
  fechaContratacion?: string;
  estado: EstadoConductor;
  urlLicencia?: string;
  createdAt?: string;
  updatedAt?: string;
  _raw?: any;
}
