export interface Oficina {
  id: string;
  nombre: string;
  codigo: string;
  direccion: string;
  telefono: string;
  email: string;
  agenciaId: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
