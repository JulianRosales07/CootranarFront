export type EstadoConductor = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';

export interface Conductor {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  licencia: string;
  telefono: string;
  email: string;
  fechaNacimiento: Date;
  estado: EstadoConductor;
  createdAt: Date;
  updatedAt: Date;
}
