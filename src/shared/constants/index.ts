export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TAQUILLA: '/taquilla',
  TIQUETES: '/tiquetes',
  GESTION_TIQUETES: '/gestion-tiquetes',
  TIQUETE_DETAIL: '/tiquetes/:id',
  ENCOMIENDAS: '/encomiendas',
  ENCOMIENDA_DETAIL: '/encomiendas/:id',
  DESPACHOS: '/encomiendas/despachos',
  RUTAS: '/rutas',
  USUARIOS: '/usuarios',
  AGENCIAS: '/agencias',
  ASEGURADORAS: '/aseguradoras',
  CIUDADES: '/ciudades',
  CONDUCTORES: '/conductores',
  OFICINAS: '/oficinas',
  POLIZAS: '/polizas',
  VEHICULOS: '/vehiculos',
  VIAJES: '/viajes',
  TIPOS_SERVICIO: '/tipos-servicio',
  TIPOS_BUS: '/tipos-bus',
  TAQUILLEROS: '/empleados/taquilleros',
  EMPLEADOS_ENCOMIENDAS: '/empleados/encomiendas',
  OFICINAS_ENCOMIENDAS: '/oficinas-encomiendas',
  TARIFAS_RUTA: '/rutas/tarifas',
  DEPARTAMENTOS: '/departamentos',
} as const;

export const ESTADOS_TIQUETE = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado',
  USADO: 'Usado',
} as const;

export const ESTADOS_ENCOMIENDA = {
  COTIZADA: 'Cotizada',
  REGISTRADA: 'Registrada',
  EN_TRANSITO: 'En Tránsito',
  EN_DESTINO: 'En Destino',
  ENTREGADA: 'Entregada',
  DEVUELTA: 'Devuelta',
} as const;

export const ESTADOS_DESPACHO = {
  PROGRAMADO: 'Programado',
  EN_RUTA: 'En Ruta',
  LLEGADO: 'Llegado',
} as const;

export const ROLES = {
  ADMIN: 'Administrador',
  OPERADOR: 'Operador',
} as const;
