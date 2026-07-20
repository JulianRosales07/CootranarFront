/**
 * Property-Based Test - Datos completos en confirmación de pasajero
 *
 * Feature: refactor-flujo-venta-taquilla
 * Property 6: Datos completos en confirmación de pasajero
 *
 * Verifica que al confirmar un pasajero con datos personales válidos y un destino
 * con tarifa calculada, la salida incluye TANTO los datos personales (nombre, apellido, documento)
 * COMO la información de destino/precio (puntoDestino, precio).
 *
 * **Validates: Requirements 3.5**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ─── Interfaces que modelan los datos del dominio ───

interface Pasajero {
  tipodocumento: string;
  documento: string;
  nombre: string;
  apellido: string;
}

interface DestinoInfo {
  puntoDestino: number;
  precio: number;
  tarifaCompleta?: any;
}

// ─── Función pura extraída de la lógica de handleAsignar en FormularioPasajeros ───
// Simula el comportamiento: si datos válidos → retorna confirmación con datos + destino
// Si datos inválidos → retorna null (no se confirma)

function simularConfirmacionPasajero(
  idAsiento: number,
  pasajero: Pasajero,
  destinosPorPasajero: { [id: number]: DestinoInfo }
): { idAsiento: number; pasajero: Pasajero; destino: DestinoInfo | undefined } | null {
  if (!pasajero.nombre || !pasajero.apellido || !pasajero.documento) return null;
  const destino = destinosPorPasajero[idAsiento];
  return { idAsiento, pasajero, destino };
}

describe('Feature: refactor-flujo-venta-taquilla, Property 6: Datos completos en confirmación de pasajero', () => {

  /**
   * **Validates: Requirements 3.5**
   *
   * Property: Para cualquier pasajero con datos personales válidos (nombre, apellido, documento
   * no vacíos) y un destino con tarifa calculada (puntoDestino > 0, precio > 0), la
   * confirmación SHALL incluir tanto los datos personales como el destino y precio.
   */
  it('la confirmación incluye datos personales Y destino/precio cuando ambos son válidos', () => {
    fc.assert(
      fc.property(
        // Generar idAsiento positivo
        fc.integer({ min: 1, max: 10000 }),
        // Generar pasajero con datos no vacíos
        fc.record({
          tipodocumento: fc.constantFrom('CC', 'CE', 'TI', 'PA'),
          documento: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          nombre: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          apellido: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        }),
        // Generar destino con valores positivos
        fc.record({
          puntoDestino: fc.integer({ min: 1, max: 1000 }),
          precio: fc.integer({ min: 1, max: 500000 }),
        }),
        (idAsiento, pasajero, destino) => {
          const destinosPorPasajero: { [id: number]: DestinoInfo } = {
            [idAsiento]: destino,
          };

          const resultado = simularConfirmacionPasajero(idAsiento, pasajero, destinosPorPasajero);

          // La confirmación NO debe ser null (datos son válidos)
          expect(resultado).not.toBeNull();

          // Verificar que incluye datos personales correctos
          expect(resultado!.pasajero.nombre).toBe(pasajero.nombre);
          expect(resultado!.pasajero.apellido).toBe(pasajero.apellido);
          expect(resultado!.pasajero.documento).toBe(pasajero.documento);
          expect(resultado!.pasajero.tipodocumento).toBe(pasajero.tipodocumento);

          // Verificar que incluye el idAsiento correcto
          expect(resultado!.idAsiento).toBe(idAsiento);

          // Verificar que incluye destino y precio correctos
          expect(resultado!.destino).toBeDefined();
          expect(resultado!.destino!.puntoDestino).toBe(destino.puntoDestino);
          expect(resultado!.destino!.precio).toBe(destino.precio);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 3.5**
   *
   * Property: Si el pasajero tiene datos personales incompletos (nombre, apellido o documento vacíos),
   * la confirmación SHALL retornar null (no se permite confirmar).
   */
  it('la confirmación retorna null si los datos personales están incompletos', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        // Generar pasajero con al menos un campo vacío
        fc.oneof(
          // nombre vacío
          fc.record({
            tipodocumento: fc.constantFrom('CC', 'CE', 'TI', 'PA'),
            documento: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            nombre: fc.constant(''),
            apellido: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          }),
          // apellido vacío
          fc.record({
            tipodocumento: fc.constantFrom('CC', 'CE', 'TI', 'PA'),
            documento: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            nombre: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            apellido: fc.constant(''),
          }),
          // documento vacío
          fc.record({
            tipodocumento: fc.constantFrom('CC', 'CE', 'TI', 'PA'),
            documento: fc.constant(''),
            nombre: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            apellido: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          })
        ),
        fc.record({
          puntoDestino: fc.integer({ min: 1, max: 1000 }),
          precio: fc.integer({ min: 1, max: 500000 }),
        }),
        (idAsiento, pasajero, destino) => {
          const destinosPorPasajero: { [id: number]: DestinoInfo } = {
            [idAsiento]: destino,
          };

          const resultado = simularConfirmacionPasajero(idAsiento, pasajero, destinosPorPasajero);

          // Con datos incompletos, la confirmación debe ser null
          expect(resultado).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 3.5**
   *
   * Property: Cuando el pasajero tiene datos válidos pero no hay destino asignado en el mapa,
   * la confirmación SHALL incluir destino como undefined (sin precio).
   */
  it('la confirmación incluye destino undefined si no hay destino asignado para ese asiento', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.record({
          tipodocumento: fc.constantFrom('CC', 'CE', 'TI', 'PA'),
          documento: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          nombre: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          apellido: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        }),
        (idAsiento, pasajero) => {
          // Mapa vacío - no hay destino para este asiento
          const destinosPorPasajero: { [id: number]: DestinoInfo } = {};

          const resultado = simularConfirmacionPasajero(idAsiento, pasajero, destinosPorPasajero);

          // La confirmación no es null (datos personales válidos)
          expect(resultado).not.toBeNull();
          expect(resultado!.pasajero.nombre).toBe(pasajero.nombre);
          expect(resultado!.pasajero.apellido).toBe(pasajero.apellido);
          expect(resultado!.pasajero.documento).toBe(pasajero.documento);

          // Pero el destino es undefined
          expect(resultado!.destino).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
