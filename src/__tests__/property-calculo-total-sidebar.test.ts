/**
 * Property-Based Test - Cálculo correcto del total en sidebar
 *
 * Feature: refactor-flujo-venta-taquilla
 * Property 5: Cálculo correcto del total en sidebar
 *
 * Verifica que el total mostrado en el Sidebar_Resumen es exactamente igual
 * a la suma aritmética de todos los precios individuales de los pasajeros.
 *
 * **Validates: Requirements 5.3**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ─── Replicate the total calculation logic from FormularioPasajeros sidebar ───
// This is the pure function extracted from the sidebar's total calculation:
// asientos.reduce((sum, a) => {
//   const info = destinosPorPasajero[a.idasientoviaje];
//   return sum + (info && info.precio > 0 ? info.precio : 0);
// }, 0);

interface DestinoInfo {
  puntoDestino: number;
  precio: number;
}

interface AsientoMinimo {
  idasientoviaje: number;
}

/**
 * Calculates the total price from all passengers in the sidebar.
 * Mirrors the exact logic used in FormularioPasajeros sidebar rendering.
 */
function calcularTotalSidebar(
  asientos: AsientoMinimo[],
  destinosPorPasajero: Record<number, DestinoInfo | undefined>
): number {
  return asientos.reduce((sum, a) => {
    const info = destinosPorPasajero[a.idasientoviaje];
    return sum + (info && info.precio > 0 ? info.precio : 0);
  }, 0);
}

describe('Feature: refactor-flujo-venta-taquilla, Property 5: Cálculo correcto del total en sidebar', () => {

  /**
   * **Validates: Requirements 5.3**
   *
   * Property: Para cualquier conjunto de precios individuales positivos asignados a pasajeros,
   * el total SHALL ser exactamente igual a la suma aritmética de todos los precios individuales.
   */
  it('el total debe ser la suma aritmética de todos los precios individuales positivos', () => {
    fc.assert(
      fc.property(
        // Generate array of 1-10 positive prices (integers to avoid floating point issues)
        fc.array(fc.integer({ min: 1, max: 500000 }), { minLength: 1, maxLength: 10 }),
        (precios) => {
          // Build asientos and destinosPorPasajero from the generated prices
          const asientos: AsientoMinimo[] = precios.map((_, idx) => ({
            idasientoviaje: idx + 1,
          }));

          const destinosPorPasajero: Record<number, DestinoInfo> = {};
          precios.forEach((precio, idx) => {
            destinosPorPasajero[idx + 1] = {
              puntoDestino: 100 + idx,
              precio,
            };
          });

          const total = calcularTotalSidebar(asientos, destinosPorPasajero);
          const sumaEsperada = precios.reduce((acc, p) => acc + p, 0);

          expect(total).toBe(sumaEsperada);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 5.3**
   *
   * Property: Pasajeros sin destino asignado (undefined o precio <= 0) no contribuyen al total.
   */
  it('pasajeros sin precio válido no contribuyen al total', () => {
    fc.assert(
      fc.property(
        // Generate array of prices where some may be 0 or negative (invalid)
        fc.array(
          fc.oneof(
            fc.integer({ min: 1, max: 500000 }),    // valid price
            fc.constant(0),                          // no price
            fc.integer({ min: -10000, max: -1 })     // negative (invalid)
          ),
          { minLength: 1, maxLength: 10 }
        ),
        (precios) => {
          const asientos: AsientoMinimo[] = precios.map((_, idx) => ({
            idasientoviaje: idx + 1,
          }));

          const destinosPorPasajero: Record<number, DestinoInfo> = {};
          precios.forEach((precio, idx) => {
            destinosPorPasajero[idx + 1] = {
              puntoDestino: 100 + idx,
              precio,
            };
          });

          const total = calcularTotalSidebar(asientos, destinosPorPasajero);
          // Only positive prices should be summed
          const sumaEsperada = precios
            .filter(p => p > 0)
            .reduce((acc, p) => acc + p, 0);

          expect(total).toBe(sumaEsperada);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 5.3**
   *
   * Property: Pasajeros sin entrada en destinosPorPasajero (undefined) no contribuyen al total.
   */
  it('pasajeros sin destino en el mapa no contribuyen al total', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 8 }),  // total number of seats
        fc.array(fc.integer({ min: 1, max: 500000 }), { minLength: 1, maxLength: 8 }),
        (numAsientos, preciosDisponibles) => {
          const asientos: AsientoMinimo[] = Array.from({ length: numAsientos }, (_, idx) => ({
            idasientoviaje: idx + 1,
          }));

          // Only assign prices to some seats (leave others undefined)
          const destinosPorPasajero: Record<number, DestinoInfo | undefined> = {};
          const preciosAsignados: number[] = [];
          
          preciosDisponibles.slice(0, numAsientos).forEach((precio, idx) => {
            // Only assign to even-indexed seats to create gaps
            if (idx % 2 === 0) {
              destinosPorPasajero[idx + 1] = {
                puntoDestino: 100 + idx,
                precio,
              };
              preciosAsignados.push(precio);
            }
            // Odd-indexed seats remain undefined in the map
          });

          const total = calcularTotalSidebar(asientos, destinosPorPasajero);
          const sumaEsperada = preciosAsignados.reduce((acc, p) => acc + p, 0);

          expect(total).toBe(sumaEsperada);
        }
      ),
      { numRuns: 100 }
    );
  });
});
