export interface Oficina {
  id: string;
  nombre: string;
  codigo: string;
  agenciaId: string;
  activo: boolean;
  direccion?: string;
  telefono?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}
