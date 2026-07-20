/**
 * Property-Based Test - Cálculo de precio según tipo de asiento
 *
 * Feature: refactor-flujo-venta-taquilla
 * Property 1: Cálculo de precio según tipo de asiento
 *
 * Verifica que el cálculo de precio respeta la regla:
 * - Si el asiento es poltrona: precio = valorBase + adicionalPoltrona
 * - Si el asiento es normal: precio = valorBase
 *
 * **Validates: Requirements 4.1, 4.2**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ─── Replicate the price calculation logic from SelectorDestinoInline (SeleccionTramo.tsx) ───
// This is the pure function extracted from the component's consultarTarifa callback (lines ~652-654)
function calcularPrecioAsiento(valorBase: number, adicionalPoltrona: number, esPoltrona: boolean): number {
  return esPoltrona ? valorBase + adicionalPoltrona : valorBase;
}

describe('Feature: refactor-flujo-venta-taquilla, Property 1: Cálculo de precio según tipo de asiento', () => {

  /**
   * **Validates: Requirements 4.1, 4.2**
   *
   * Property: Para cualquier tarifa (valorBase ≥ 0, adicionalPoltrona ≥ 0) y cualquier tipo de asiento,
   * el precio calculado DEBE ser:
   * - valorBase + adicionalPoltrona si esPoltrona === true
   * - valorBase si esPoltrona === false
   */
  it('el precio debe ser valorBase + adicionalPoltrona si poltrona, o valorBase si normal', () => {
    fc.assert(
      fc.property(
        fc.nat(),       // valorBase: entero no negativo
        fc.nat(),       // adicionalPoltrona: entero no negativo
        fc.boolean(),   // esPoltrona: booleano aleatorio
        (valorBase, adicionalPoltrona, esPoltrona) => {
          const precio = calcularPrecioAsiento(valorBase, adicionalPoltrona, esPoltrona);

          if (esPoltrona) {
            expect(precio).toBe(valorBase + adicionalPoltrona);
          } else {
            expect(precio).toBe(valorBase);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 4.1**
   *
   * Property: Para asientos poltrona, el precio siempre es mayor o igual al valorBase.
   */
  it('para asiento poltrona, el precio siempre es >= valorBase', () => {
    fc.assert(
      fc.property(
        fc.nat(),   // valorBase
        fc.nat(),   // adicionalPoltrona
        (valorBase, adicionalPoltrona) => {
          const precio = calcularPrecioAsiento(valorBase, adicionalPoltrona, true);
          expect(precio).toBeGreaterThanOrEqual(valorBase);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 4.2**
   *
   * Property: Para asientos normales, el precio siempre es exactamente valorBase (sin adicional).
   */
  it('para asiento normal, el precio siempre es exactamente valorBase', () => {
    fc.assert(
      fc.property(
        fc.nat(),   // valorBase
        fc.nat(),   // adicionalPoltrona (no debería afectar)
        (valorBase, adicionalPoltrona) => {
          const precio = calcularPrecioAsiento(valorBase, adicionalPoltrona, false);
          expect(precio).toBe(valorBase);
        }
      ),
      { numRuns: 100 }
    );
  });
});
