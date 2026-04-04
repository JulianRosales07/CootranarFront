export interface EmpleadoEncomienda {
  id: string;
  idusuario?: number;
  nombre: string;
  apellido?: string;
  correo?: string;
  email?: string; // Alias for correo
  tipodocumento?: string;
  documento: string;
  telefono: string;
  idoficinaencomienda?: number;
  direccionoficina?: string;
  idciudad?: number;
  nombreciudad?: string;
  activo: boolean;
}
