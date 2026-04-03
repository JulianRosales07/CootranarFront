export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TIQUETES: '/tiquetes',
  TIQUETE_DETAIL: '/tiquetes/:id',
  ENCOMIENDAS: '/encomiendas',
  ENCOMIENDA_DETAIL: '/encomiendas/:id',
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
  RECIBIDA: 'Recibida',
  EN_TRANSITO: 'En Tránsito',
  ENTREGADA: 'Entregada',
  DEVUELTA: 'Devuelta',
} as const;

export const ROLES = {
  ADMIN: 'Administrador',
  OPERADOR: 'Operador',
} as const;
