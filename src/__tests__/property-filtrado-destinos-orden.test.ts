/**
 * Property-Based Test - Filtrado de destinos por orden de ruta
 *
 * Feature: refactor-flujo-venta-taquilla
 * Property 2: Filtrado de destinos por orden de ruta
 *
 * Verifica que el filtrado de puntos de destino respeta la regla:
 * - Solo se incluyen puntos con orden > origenSeleccionado.orden
 * - Ningún punto con orden <= origenSeleccionado.orden se incluye
 *
 * **Validates: Requirements 2.6**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ─── Interfaces ───
interface PuntoRuta {
  idpuntoruta: number;
  nombre: string;
  orden: number;
}

// ─── Replicate the filtering logic from SelectorDestinoInline (SeleccionTramo.tsx) ───
// Pure function extracted from component logic (lines ~633-636)
function filtrarPuntosDestino(puntosRuta: PuntoRuta[], puntoOrigenId: number): PuntoRuta[] {
  const puntoOrigenObj = puntosRuta.find(p => p.idpuntoruta === puntoOrigenId);
  return puntosRuta.filter(p =>
    puntoOrigenObj ? p.orden > puntoOrigenObj.orden : false
  );
}

// ─── Generador: lista de PuntoRuta con órdenes distintas ───
function generarPuntosRutaConOrdenesDistintas() {
  return fc
    .uniqueArray(fc.integer({ min: 1, max: 1000 }), { minLength: 2, maxLength: 20 })
    .chain((ordenes) => {
      const puntos = ordenes.map((orden, idx) => ({
        idpuntoruta: idx + 1,
        nombre: `Punto_${idx + 1}`,
        orden,
      }));
      // Seleccionar un índice aleatorio como punto de origen
      const indiceOrigen = fc.integer({ min: 0, max: puntos.length - 1 });
      return indiceOrigen.map((idx) => ({
        puntosRuta: puntos,
        origenIdx: idx,
      }));
    });
}

describe('Feature: refactor-flujo-venta-taquilla, Property 2: Filtrado de destinos por orden de ruta', () => {

  /**
   * **Validates: Requirements 2.6**
   *
   * Property: Para cualquier lista de PuntoRuta con órdenes distintas y un punto de origen
   * seleccionado, todos los puntos de destino filtrados DEBEN tener orden > origen.orden.
   */
  it('todos los destinos filtrados tienen orden > origenSeleccionado.orden', () => {
    fc.assert(
      fc.property(
        generarPuntosRutaConOrdenesDistintas(),
        ({ puntosRuta, origenIdx }) => {
          const origen = puntosRuta[origenIdx];
          const destinos = filtrarPuntosDestino(puntosRuta, origen.idpuntoruta);

          for (const destino of destinos) {
            expect(destino.orden).toBeGreaterThan(origen.orden);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 2.6**
   *
   * Property: Ningún punto con orden <= origenSeleccionado.orden debe estar incluido
   * en los destinos filtrados.
   */
  it('ningún punto con orden <= origen.orden está incluido en los destinos', () => {
    fc.assert(
      fc.property(
        generarPuntosRutaConOrdenesDistintas(),
        ({ puntosRuta, origenIdx }) => {
          const origen = puntosRuta[origenIdx];
          const destinos = filtrarPuntosDestino(puntosRuta, origen.idpuntoruta);
          const idsDestinos = new Set(destinos.map(d => d.idpuntoruta));

          // Verificar que ningún punto con orden <= origen.orden está en destinos
          const puntosExcluidos = puntosRuta.filter(p => p.orden <= origen.orden);
          for (const excluido of puntosExcluidos) {
            expect(idsDestinos.has(excluido.idpuntoruta)).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 2.6**
   *
   * Property: Si el punto de origen no existe en la lista, no se devuelve ningún destino.
   */
  it('si el punto de origen no existe en la lista, devuelve lista vacía', () => {
    fc.assert(
      fc.property(
        generarPuntosRutaConOrdenesDistintas(),
        ({ puntosRuta }) => {
          // Usar un id que no existe en la lista
          const maxId = Math.max(...puntosRuta.map(p => p.idpuntoruta));
          const idInexistente = maxId + 100;
          const destinos = filtrarPuntosDestino(puntosRuta, idInexistente);
          expect(destinos).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
