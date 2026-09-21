import { httpClient } from '../api/httpClient';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Reglas generales del programa (fila única de configuracionmillas). */
export interface ReglasMillas {
  idconfiguracion: number;
  programaactivo: boolean;
  nombreprograma: string;
  subtitulo: string;
  pesospormilla: number;
  valormillacop: number;
  bonobienvenida: number;
  montosrapidos: number[];
  acumulataquilla: boolean;
  acumulaecommerce: boolean;
  aplicarmultiplicadornivel: boolean;
  fechaactualizacion?: string;
  idusuarioactualiza?: number | null;
}

export interface ReglasMillasInput {
  programaActivo: boolean;
  nombrePrograma: string;
  subtitulo: string;
  pesosPorMilla: number;
  valorMillaCop: number;
  bonoBienvenida: number;
  montosRapidos: number[];
  acumulaTaquilla: boolean;
  acumulaEcommerce: boolean;
  aplicarMultiplicadorNivel: boolean;
}

export interface NivelMillas {
  idnivel: number;
  codigo: string;
  nombre: string;
  minmillas: number;
  maxmillas: number | null;
  color: string;
  badgebg: string | null;
  multiplicador: number;
  descuentotiquetes: string;
  beneficios: string[];
  orden: number;
  activo: boolean;
}

export interface NivelMillasInput {
  codigo: string;
  nombre: string;
  minMillas: number;
  maxMillas: number | null;
  color: string;
  badgeBg?: string | null;
  multiplicador: number;
  descuentoTiquetes: string;
  beneficios: string[];
  activo: boolean;
}

export interface RecompensaMillas {
  idrecompensa: number;
  titulo: string;
  descripcion: string | null;
  millasrequeridas: number;
  valordescuentocop: number;
  categoria: string;
  icono: string;
  orden: number;
  destacado: boolean;
  activo: boolean;
}

export interface RecompensaMillasInput {
  titulo: string;
  descripcion: string | null;
  millasRequeridas: number;
  valorDescuentoCop: number;
  categoria: string;
  icono: string;
  destacado: boolean;
  activo: boolean;
}

export type TipoPromocion = 'MULTIPLICADOR' | 'MILLAS_EXTRA' | 'PORCENTAJE_EXTRA';
export type OrigenPromocion = 'Taquilla' | 'E-commerce' | 'AMBOS';

export interface PromocionMillas {
  idpromocion: number;
  nombre: string;
  descripcion: string | null;
  tipo: TipoPromocion;
  valor: number;
  fechainicio: string;
  fechafin: string;
  origenaplicable: OrigenPromocion;
  idruta: number | null;
  nombreruta: string | null;
  montominimo: number;
  topemillas: number | null;
  icono: string;
  color: string;
  activo: boolean;
  vigente: boolean;
  fechacreacion?: string;
}

export interface PromocionMillasInput {
  nombre: string;
  descripcion: string | null;
  tipo: TipoPromocion;
  valor: number;
  fechaInicio: string;
  fechaFin: string;
  origenAplicable: OrigenPromocion;
  idRuta: number | null;
  montoMinimo: number;
  topeMillas: number | null;
  icono: string;
  color: string;
  activo: boolean;
}

export interface ConfiguracionMillasCompleta {
  configuracion: ReglasMillas;
  niveles: NivelMillas[];
  recompensas: RecompensaMillas[];
  promociones: PromocionMillas[];
}

// ── Servicio ─────────────────────────────────────────────────────────────────

const BASE = '/configuracion-millas';

export const configuracionMillasApi = {
  // Todo en una sola llamada para la pantalla de administración
  obtenerTodo: () =>
    httpClient.get<{ success: boolean; data: ConfiguracionMillasCompleta }>(BASE),

  // Reglas generales
  obtenerReglas: () =>
    httpClient.get(`${BASE}/configuracion`),

  actualizarReglas: (data: ReglasMillasInput) =>
    httpClient.put(`${BASE}/configuracion`, data),

  // Niveles del club
  listarNiveles: () =>
    httpClient.get(`${BASE}/niveles`),

  crearNivel: (data: NivelMillasInput) =>
    httpClient.post(`${BASE}/niveles`, data),

  actualizarNivel: (idNivel: number, data: NivelMillasInput & { orden?: number }) =>
    httpClient.put(`${BASE}/niveles/${idNivel}`, data),

  eliminarNivel: (idNivel: number) =>
    httpClient.delete(`${BASE}/niveles/${idNivel}`),

  // Catálogo de recompensas
  listarRecompensas: () =>
    httpClient.get(`${BASE}/recompensas`),

  crearRecompensa: (data: RecompensaMillasInput) =>
    httpClient.post(`${BASE}/recompensas`, data),

  actualizarRecompensa: (idRecompensa: number, data: RecompensaMillasInput & { orden?: number }) =>
    httpClient.put(`${BASE}/recompensas/${idRecompensa}`, data),

  eliminarRecompensa: (idRecompensa: number) =>
    httpClient.delete(`${BASE}/recompensas/${idRecompensa}`),

  // Promociones / campañas
  listarPromociones: (soloVigentes = false) =>
    httpClient.get(`${BASE}/promociones`, { params: { soloVigentes } }),

  crearPromocion: (data: PromocionMillasInput) =>
    httpClient.post(`${BASE}/promociones`, data),

  actualizarPromocion: (idPromocion: number, data: PromocionMillasInput) =>
    httpClient.put(`${BASE}/promociones/${idPromocion}`, data),

  eliminarPromocion: (idPromocion: number) =>
    httpClient.delete(`${BASE}/promociones/${idPromocion}`),
};

export default configuracionMillasApi;
