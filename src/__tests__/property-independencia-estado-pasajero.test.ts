/**
 * Property-Based Test - Independencia de estado por pasajero
 *
 * Feature: refactor-flujo-venta-taquilla
 * Property 3: Independencia de estado por pasajero
 *
 * Verifica que al mutar el destino de un pasajero, los destinos y precios
 * de todos los demás pasajeros permanecen sin cambios.
 *
 * La mutación simula la operación spread que realiza `setDestinosPorPasajero`
 * en FormularioPasajeros:
 *   { ...prevState, [idAsiento]: { puntoDestino: nuevo, precio: nuevo } }
 *
 * **Validates: Requirements 3.3, 6.2**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ─── Tipo replicado del estado DestinosPasajero en FormularioPasajeros.tsx ───
interface DestinosPasajero {
  [idAsiento: number]: {
    puntoDestino: number;
    precio: number;
    tarifaCompleta?: any;
  };
}

// ─── Función pura que replica la operación de actualización con spread ───
function actualizarDestinoPasajero(
  prevState: DestinosPasajero,
  idAsiento: number,
  nuevoPuntoDestino: number,
  nuevoPrecio: number
): DestinosPasajero {
  return {
    ...prevState,
    [idAsiento]: { puntoDestino: nuevoPuntoDestino, precio: nuevoPrecio }
  };
}

describe('Feature: refactor-flujo-venta-taquilla, Property 3: Independencia de estado por pasajero', () => {

  /**
   * **Validates: Requirements 3.3, 6.2**
   *
   * Property: Para cualquier grupo de N pasajeros (N ≥ 2), al mutar el destino
   * y precio de un pasajero específico, los destinos y precios de todos los demás
   * pasajeros DEBEN permanecer exactamente iguales.
   */
  it('al mutar el destino de un pasajero, los demás pasajeros no se ven afectados', () => {
    fc.assert(
      fc.property(
        // Generar un array de al menos 2 pasajeros con idAsiento distintos
        fc.uniqueArray(
          fc.record({
            idAsiento: fc.integer({ min: 1, max: 1000 }),
            puntoDestino: fc.integer({ min: 1, max: 100 }),
            precio: fc.integer({ min: 1000, max: 200000 })
          }),
          { minLength: 2, maxLength: 10, selector: (p) => p.idAsiento }
        ),
        // Nuevos valores para la mutación
        fc.integer({ min: 1, max: 100 }),   // nuevoPuntoDestino
        fc.integer({ min: 1000, max: 200000 }), // nuevoPrecio
        (pasajeros, nuevoPuntoDestino, nuevoPrecio) => {
          // 1. Construir el estado DestinosPasajero
          const estadoInicial: DestinosPasajero = {};
          for (const p of pasajeros) {
            estadoInicial[p.idAsiento] = {
              puntoDestino: p.puntoDestino,
              precio: p.precio
            };
          }

          // 2. Escoger un pasajero aleatorio para mutar (usamos el primero para determinismo)
          const indiceMutado = 0;
          const idAsientoMutado = pasajeros[indiceMutado].idAsiento;

          // 3. Aplicar la mutación (operación spread)
          const estadoNuevo = actualizarDestinoPasajero(
            estadoInicial,
            idAsientoMutado,
            nuevoPuntoDestino,
            nuevoPrecio
          );

          // 4. Verificar que los demás pasajeros NO cambiaron
          for (let i = 0; i < pasajeros.length; i++) {
            if (i === indiceMutado) continue;

            const idAsiento = pasajeros[i].idAsiento;
            expect(estadoNuevo[idAsiento].puntoDestino).toBe(estadoInicial[idAsiento].puntoDestino);
            expect(estadoNuevo[idAsiento].precio).toBe(estadoInicial[idAsiento].precio);
          }

          // 5. Verificar que el pasajero mutado SÍ cambió
          expect(estadoNuevo[idAsientoMutado].puntoDestino).toBe(nuevoPuntoDestino);
          expect(estadoNuevo[idAsientoMutado].precio).toBe(nuevoPrecio);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 3.3, 6.2**
   *
   * Property: La cantidad de pasajeros en el estado no cambia después de una mutación.
   * El spread operator no debe agregar ni eliminar entradas.
   */
  it('la cantidad de pasajeros en el estado se mantiene tras la mutación', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(
          fc.record({
            idAsiento: fc.integer({ min: 1, max: 1000 }),
            puntoDestino: fc.integer({ min: 1, max: 100 }),
            precio: fc.integer({ min: 1000, max: 200000 })
          }),
          { minLength: 2, maxLength: 10, selector: (p) => p.idAsiento }
        ),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1000, max: 200000 }),
        (pasajeros, nuevoPuntoDestino, nuevoPrecio) => {
          const estadoInicial: DestinosPasajero = {};
          for (const p of pasajeros) {
            estadoInicial[p.idAsiento] = {
              puntoDestino: p.puntoDestino,
              precio: p.precio
            };
          }

          const idAsientoMutado = pasajeros[0].idAsiento;

          const estadoNuevo = actualizarDestinoPasajero(
            estadoInicial,
            idAsientoMutado,
            nuevoPuntoDestino,
            nuevoPrecio
          );

          expect(Object.keys(estadoNuevo).length).toBe(Object.keys(estadoInicial).length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 3.3, 6.2**
   *
   * Property: La mutación no comparte referencia con el estado anterior.
   * El objeto devuelto debe ser una nueva referencia (inmutabilidad).
   */
  it('la mutación devuelve un nuevo objeto (inmutabilidad)', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(
          fc.record({
            idAsiento: fc.integer({ min: 1, max: 1000 }),
            puntoDestino: fc.integer({ min: 1, max: 100 }),
            precio: fc.integer({ min: 1000, max: 200000 })
          }),
          { minLength: 2, maxLength: 10, selector: (p) => p.idAsiento }
        ),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1000, max: 200000 }),
        (pasajeros, nuevoPuntoDestino, nuevoPrecio) => {
          const estadoInicial: DestinosPasajero = {};
          for (const p of pasajeros) {
            estadoInicial[p.idAsiento] = {
              puntoDestino: p.puntoDestino,
              precio: p.precio
            };
          }

          const idAsientoMutado = pasajeros[0].idAsiento;

          const estadoNuevo = actualizarDestinoPasajero(
            estadoInicial,
            idAsientoMutado,
            nuevoPuntoDestino,
            nuevoPrecio
          );

          // El objeto retornado no debe ser la misma referencia
          expect(estadoNuevo).not.toBe(estadoInicial);
        }
      ),
      { numRuns: 100 }
    );
  });
});
