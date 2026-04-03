export interface OficinaEncomienda {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  ciudadId: string;
  ciudadNombre?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
