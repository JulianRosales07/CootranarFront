import busExterior from '../../../assets/BusCootranar.jpg';
import heroBanner from '../../../assets/cootranar_hero.png';

/**
 * Datos y persistencia de la galería del banner del dashboard.
 *
 * Las fotos viven en localStorage, así que son por navegador: lo que sube un
 * administrador no lo ven los demás. Para compartirlas habría que subirlas a
 * Storage y guardarlas en base de datos.
 */

export interface FotoCootranar {
  id: string;
  url: string;
  titulo: string;
  descripcion: string;
  tag: string;
  icono: string;
  esPersonalizada?: boolean;
}

export const FOTOS_PREDETERMINADAS: FotoCootranar[] = [
  {
    id: '1',
    url: busExterior,
    titulo: 'Flota Moderna de Pasajeros',
    descripcion: 'Unidades de última tecnología con monitoreo satelital en tiempo real.',
    tag: 'Transporte Intermunicipal',
    icono: 'directions_bus',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1600&auto=format&fit=crop',
    titulo: 'Confort y Seguridad en Ruta',
    descripcion: 'Cabinas climatizadas, silletería ergonómica reclinable y entretenimiento a bordo.',
    tag: 'Experiencia VIP',
    icono: 'airline_seat_recline_extra',
  },
  {
    id: '3',
    url: heroBanner,
    titulo: 'Servicio Especializado de Encomiendas',
    descripcion: 'Puntos de recepción directa en agencias y terminales con despacho diario.',
    tag: 'Carga & Paquetería',
    icono: 'local_shipping',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1600&auto=format&fit=crop',
    titulo: 'Red de Conexión Regional',
    descripcion: 'Más de 50 rutas estratégicas conectando Nariño, Valle del Cauca y el Suroccidente.',
    tag: 'Cobertura Nacional',
    icono: 'hub',
  },
];

export const STORAGE_KEY = 'cootranar_dashboard_banner_photos';

/** Tamaño típico del cupo de localStorage, para mostrar cuánto queda. */
export const CUPO_APROXIMADO_BYTES = 5 * 1024 * 1024;

export const leerFotosGuardadas = (): FotoCootranar[] => {
  try {
    const guardadas = localStorage.getItem(STORAGE_KEY);
    if (guardadas) {
      const parsed = JSON.parse(guardadas);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as FotoCootranar[];
    }
  } catch {
    // JSON corrupto: se cae a las predeterminadas
  }
  return FOTOS_PREDETERMINADAS;
};

export type ResultadoGuardado = { ok: true } | { ok: false; mensaje: string };

/**
 * Persiste la galería. Antes el error se ignoraba, así que al llenarse el cupo
 * los cambios se perdían sin avisar; ahora se devuelve el motivo.
 */
export const guardarFotos = (fotos: FotoCootranar[]): ResultadoGuardado => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fotos));
    return { ok: true };
  } catch (err) {
    const esCuota =
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return {
      ok: false,
      mensaje: esCuota
        ? 'El navegador se quedó sin espacio para guardar la galería. Elimina alguna foto antes de agregar otra.'
        : 'No se pudieron guardar los cambios de la galería en este navegador.',
    };
  }
};

/** Peso aproximado en bytes de la galería serializada. */
export const pesoAproximado = (fotos: FotoCootranar[]): number => {
  try {
    return new Blob([JSON.stringify(fotos)]).size;
  } catch {
    return 0;
  }
};

export const formatearPeso = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Redimensiona y recomprime la imagen antes de guardarla. Una foto de cámara en
 * base64 puede pesar varios MB y llenar el cupo de localStorage con una sola.
 */
export const comprimirImagen = (
  file: File,
  maxAncho = 1600,
  calidad = 0.82
): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('El archivo no es una imagen válida.'));
      img.onload = () => {
        const escala = Math.min(1, maxAncho / (img.width || maxAncho));
        const ancho = Math.max(Math.round((img.width || maxAncho) * escala), 1);
        const alto = Math.max(Math.round((img.height || maxAncho) * escala), 1);

        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Este navegador no pudo procesar la imagen.'));
          return;
        }
        ctx.drawImage(img, 0, 0, ancho, alto);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

/** Mueve un elemento de la lista a otra posición devolviendo un arreglo nuevo. */
export const reordenar = <T,>(lista: T[], desde: number, hasta: number): T[] => {
  if (desde === hasta || desde < 0 || hasta < 0 || desde >= lista.length || hasta >= lista.length) {
    return lista;
  }
  const copia = [...lista];
  const [movido] = copia.splice(desde, 1);
  copia.splice(hasta, 0, movido);
  return copia;
};
