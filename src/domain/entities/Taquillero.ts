export interface Taquillero {
  idusuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  tipodocumento: string;
  documento: string;
  telefono: string;
  idoficina: number;
  oficina_codigo?: string;
  agencia_nombre?: string;
  estado: boolean;
}
