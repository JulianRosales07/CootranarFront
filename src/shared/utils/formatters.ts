export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
};

/**
 * Convierte un valor de fecha "de calendario" (columna DATE de la BD) en un
 * objeto Date interpretado en la ZONA HORARIA LOCAL, sin desfase.
 *
 * Problema que resuelve: `new Date("2026-11-20")` interpreta el string como
 * UTC medianoche; en Colombia (UTC-5) eso retrocede al día anterior (19 de nov).
 * Aquí tomamos solo la parte YYYY-MM-DD y construimos la fecha con sus
 * componentes locales, evitando cualquier conversión de zona horaria.
 *
 * Acepta tanto "2026-11-20" como un ISO largo "2026-11-20T00:00:00.000Z"
 * (por si el backend aún no tiene aplicado el type parser de DATE).
 */
export const parseFechaCalendario = (valor: Date | string | null | undefined): Date | null => {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  const str = String(valor);
  const soloFecha = str.length >= 10 ? str.slice(0, 10) : str;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(soloFecha);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
};

/**
 * Formatea una fecha de calendario (columna DATE) sin desfase de zona horaria.
 * Reemplazo seguro de `new Date(f).toLocaleDateString(...)` para fechas puras
 * como fechaSalida de viajes, vencimientos de licencias/pólizas, etc.
 */
export const formatFechaCalendario = (
  valor: Date | string | null | undefined,
  opciones: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' },
): string => {
  const d = parseFechaCalendario(valor);
  if (!d) return '—';
  return d.toLocaleDateString('es-CO', opciones);
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatEstadoTiquete = (estado: string): string => {
  const estados: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    CONFIRMADO: 'Confirmado',
    CANCELADO: 'Cancelado',
    USADO: 'Usado',
  };
  return estados[estado] || estado;
};

export const formatEstadoEncomienda = (estado: string): string => {
  const estados: Record<string, string> = {
    RECIBIDA: 'Recibida',
    EN_TRANSITO: 'En Tránsito',
    ENTREGADA: 'Entregada',
    DEVUELTA: 'Devuelta',
  };
  return estados[estado] || estado;
};
