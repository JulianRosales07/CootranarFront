/** Formatea un valor numérico como pesos colombianos sin decimales. */
export const formatPeso = (valor: number | null | undefined): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor ?? 0);

/** Formatea un número entero con separadores de miles. */
export const formatNumero = (valor: number | null | undefined): string =>
  new Intl.NumberFormat('es-CO').format(valor ?? 0);

/** Formatea una fecha ISO (o YYYY-MM-DD) como "17 jul 2026". */
export const formatFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return '—';
  try {
    const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(fecha);
    const d = soloFecha
      ? (() => { const [y, m, dd] = fecha.split('-').map(Number); return new Date(y, m - 1, dd); })()
      : new Date(fecha);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

/** Formatea fecha y hora para el detalle de auditoría. */
export const formatFechaHora = (fecha: string | null | undefined): string => {
  if (!fecha) return '—';
  try {
    return new Date(fecha).toLocaleString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

/** Devuelve el primer y último día del mes actual en formato YYYY-MM-DD. */
export const rangoMesActual = (): { fechaDesde: string; fechaHasta: string } => {
  const hoy = new Date();
  const primero = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const ultimo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { fechaDesde: iso(primero), fechaHasta: iso(ultimo) };
};

export interface ColumnaExport<T> {
  key: keyof T & string;
  label: string;
  /** Marca la columna como numérica para que Excel la trate como número (permite sumar). */
  numero?: boolean;
  /** Aplica formato de moneda en Excel. Implica numero. */
  moneda?: boolean;
}

/** Hoja adicional para incluir en el libro de Excel (ej. resumen del bus). */
export interface HojaExtra {
  nombre: string;
  filas: (string | number | null)[][];
}

/**
 * Exporta filas a un archivo Excel (.xlsx) nativo y dispara la descarga.
 *
 * Las columnas marcadas como `numero`/`moneda` se escriben como valores
 * numéricos reales (no texto), de modo que contabilidad pueda sumar y aplicar
 * fórmulas directamente sobre la hoja sin reconvertir nada.
 */
export const exportarExcel = async <T extends object>(
  nombreArchivo: string,
  columnas: ColumnaExport<T>[],
  filas: T[],
  opciones: { nombreHoja?: string; hojasExtra?: HojaExtra[] } = {}
): Promise<void> => {
  const XLSX = await import('xlsx');

  const libro = XLSX.utils.book_new();

  // Hojas de contexto (resumen) primero, para que sea lo que se ve al abrir.
  for (const hoja of opciones.hojasExtra ?? []) {
    const ws = XLSX.utils.aoa_to_sheet(hoja.filas);
    ws['!cols'] = [{ wch: 26 }, { wch: 34 }];
    XLSX.utils.book_append_sheet(libro, ws, hoja.nombre.slice(0, 31));
  }

  // Hoja de datos: encabezados + filas tipadas.
  const encabezados = columnas.map(c => c.label);
  const cuerpo = filas.map(fila =>
    columnas.map(c => {
      const valor = fila[c.key];
      if (c.numero || c.moneda) {
        const n = Number(valor);
        return Number.isFinite(n) ? n : 0;
      }
      return valor == null ? '' : String(valor);
    })
  );

  const hojaDatos = XLSX.utils.aoa_to_sheet([encabezados, ...cuerpo]);

  // Ancho de columna aproximado según el contenido más largo.
  hojaDatos['!cols'] = columnas.map((c, i) => {
    const anchoContenido = cuerpo.reduce((max, fila) => {
      const largo = String(fila[i] ?? '').length;
      return largo > max ? largo : max;
    }, c.label.length);
    return { wch: Math.min(Math.max(anchoContenido + 2, 10), 45) };
  });

  // Formato de moneda/miles en las celdas correspondientes.
  const rango = XLSX.utils.decode_range(hojaDatos['!ref'] as string);
  columnas.forEach((col, idxCol) => {
    if (!col.moneda && !col.numero) return;
    const formato = col.moneda ? '"$"#,##0' : '#,##0';
    for (let r = 1; r <= rango.e.r; r++) {
      const ref = XLSX.utils.encode_cell({ r, c: idxCol });
      const celda = hojaDatos[ref];
      if (celda && celda.t === 'n') celda.z = formato;
    }
  });

  XLSX.utils.book_append_sheet(libro, hojaDatos, (opciones.nombreHoja ?? 'Datos').slice(0, 31));

  const nombre = nombreArchivo.endsWith('.xlsx') ? nombreArchivo : `${nombreArchivo}.xlsx`;
  XLSX.writeFile(libro, nombre);
};

/**
 * Exporta filas a un archivo CSV y dispara la descarga.
 * Escapa comillas y envuelve cada celda para soportar comas y saltos de línea.
 * Incluye BOM para que Excel reconozca los acentos correctamente.
 */
export const exportarCsv = <T extends object>(
  nombreArchivo: string,
  columnas: { key: keyof T & string; label: string }[],
  filas: T[]
): void => {
  const escapar = (valor: unknown): string => {
    const texto = valor == null ? '' : String(valor);
    return `"${texto.replace(/"/g, '""')}"`;
  };

  const encabezado = columnas.map(c => escapar(c.label)).join(';');
  const cuerpo = filas.map(fila => columnas.map(c => escapar(fila[c.key])).join(';'));
  const csv = '\uFEFF' + [encabezado, ...cuerpo].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo.endsWith('.csv') ? nombreArchivo : `${nombreArchivo}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
