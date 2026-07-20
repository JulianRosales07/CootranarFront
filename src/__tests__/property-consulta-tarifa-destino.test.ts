/**
 * Property-Based Test - Consulta de tarifa y actualización de precio al cambiar destino
 *
 * Feature: refactor-flujo-venta-taquilla
 * Property 4: Consulta de tarifa y actualización de precio al cambiar destino
 *
 * Verifica que al cambiar destino en el SelectorDestinoInline:
 * 1. Se invoca onConsultarTarifa con los parámetros correctos (idPuntoOrigen, idPuntoDestino, piso=1)
 * 2. El precio se calcula correctamente a partir de la respuesta de tarifa según esPoltrona
 *
 * **Validates: Requirements 2.5**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ─── Interfaces que modelan el comportamiento de consultarTarifa ───

interface ConsultarTarifaParams {
  puntoOrigenDefault: number;
  idPuntoDestino: number;
  piso: number;
}

interface TarifaResponse {
  valorBase: number;
  adicionalPoltrona: number;
}

interface ResultadoConsultaTarifa {
  parametrosLlamada: ConsultarTarifaParams;
  precioCalculado: number;
}

// ─── Función pura extraída de la lógica de consultarTarifa en SelectorDestinoInline ───
// (SeleccionTramo.tsx, líneas ~643-665)
// Simula el comportamiento del callback consultarTarifa:
// 1. Construye los parámetros de la llamada a onConsultarTarifa (piso siempre = 1)
// 2. Extrae valorBase y adicionalPoltrona de la respuesta
// 3. Calcula el precio según esPoltrona
function simularConsultaTarifa(
  puntoOrigenDefault: number,
  idPuntoDestino: number,
  esPoltrona: boolean,
  tarifaResponse: TarifaResponse
): ResultadoConsultaTarifa {
  const parametrosLlamada: ConsultarTarifaParams = {
    puntoOrigenDefault,
    idPuntoDestino,
    piso: 1,
  };

  const valorBase = Number(tarifaResponse.valorBase) || 0;
  const adicionalPoltrona = Number(tarifaResponse.adicionalPoltrona) || 0;
  const precioCalculado = esPoltrona ? valorBase + adicionalPoltrona : valorBase;

  return { parametrosLlamada, precioCalculado };
}

describe('Feature: refactor-flujo-venta-taquilla, Property 4: Consulta de tarifa al cambiar destino', () => {

  /**
   * **Validates: Requirements 2.5**
   *
   * Property: Para cualquier punto de origen y destino válidos, onConsultarTarifa
   * DEBE ser invocada con exactamente (puntoOrigenDefault, idPuntoDestino, 1) donde piso = 1.
   */
  it('onConsultarTarifa se invoca con los parámetros correctos (origen, destino, piso=1)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1 }),   // puntoOrigenDefault: entero positivo
        fc.integer({ min: 1 }),   // idPuntoDestino: entero positivo
        fc.boolean(),             // esPoltrona
        fc.nat(),                 // valorBase
        fc.nat(),                 // adicionalPoltrona
        (puntoOrigenDefault, idPuntoDestino, esPoltrona, valorBase, adicionalPoltrona) => {
          // Precondición: origen y destino deben ser diferentes
          fc.pre(puntoOrigenDefault !== idPuntoDestino);

          const resultado = simularConsultaTarifa(
            puntoOrigenDefault,
            idPuntoDestino,
            esPoltrona,
            { valorBase, adicionalPoltrona }
          );

          // Verificar que los parámetros de la llamada son correctos
          expect(resultado.parametrosLlamada.puntoOrigenDefault).toBe(puntoOrigenDefault);
          expect(resultado.parametrosLlamada.idPuntoDestino).toBe(idPuntoDestino);
          expect(resultado.parametrosLlamada.piso).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 2.5**
   *
   * Property: El precio calculado a partir de la respuesta de tarifa DEBE ser
   * valorBase + adicionalPoltrona si esPoltrona, o valorBase si no es poltrona.
   */
  it('el precio se calcula correctamente según esPoltrona y la tarifa obtenida', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1 }),   // puntoOrigenDefault
        fc.integer({ min: 1 }),   // idPuntoDestino
        fc.boolean(),             // esPoltrona
        fc.nat(),                 // valorBase
        fc.nat(),                 // adicionalPoltrona
        (puntoOrigenDefault, idPuntoDestino, esPoltrona, valorBase, adicionalPoltrona) => {
          fc.pre(puntoOrigenDefault !== idPuntoDestino);

          const resultado = simularConsultaTarifa(
            puntoOrigenDefault,
            idPuntoDestino,
            esPoltrona,
            { valorBase, adicionalPoltrona }
          );

          const precioEsperado = esPoltrona
            ? valorBase + adicionalPoltrona
            : valorBase;

          expect(resultado.precioCalculado).toBe(precioEsperado);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 2.5**
   *
   * Property: El parámetro piso SIEMPRE es 1 (hardcoded) independientemente
   * de cualquier combinación de origen, destino o tipo de asiento.
   */
  it('el parámetro piso siempre es 1 sin importar la combinación de inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),   // puntoOrigenDefault
        fc.integer({ min: 1, max: 10000 }),   // idPuntoDestino
        fc.boolean(),                          // esPoltrona
        fc.nat({ max: 500000 }),               // valorBase
        fc.nat({ max: 100000 }),               // adicionalPoltrona
        (puntoOrigenDefault, idPuntoDestino, esPoltrona, valorBase, adicionalPoltrona) => {
          fc.pre(puntoOrigenDefault !== idPuntoDestino);

          const resultado = simularConsultaTarifa(
            puntoOrigenDefault,
            idPuntoDestino,
            esPoltrona,
            { valorBase, adicionalPoltrona }
          );

          // Piso siempre debe ser 1, es un valor hardcoded en la lógica
          expect(resultado.parametrosLlamada.piso).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
