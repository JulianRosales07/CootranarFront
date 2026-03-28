import type { Taquillero } from '../entities/Taquillero';

export interface CreateTaquilleroData {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  tipodocumento?: string;
  documento: string;
  telefono: string;
  idoficina: number;
}

export interface UpdateTaquilleroData {
  nombre?: string;
  apellido?: string;
  correo?: string;
  tipodocumento?: string;
  documento?: string;
  telefono?: string;
  idoficina?: number;
}

export interface TaquilleroRepository {
  findAll(): Promise<Taquillero[]>;
  findActivos(): Promise<Taquillero[]>;
  create(data: CreateTaquilleroData): Promise<Taquillero>;
  update(idusuario: number, data: UpdateTaquilleroData): Promise<Taquillero>;
  activar(idusuario: number): Promise<void>;
}
