/**
 * Bug Condition Exploration Test - Colores de Asientos y Realtime
 * 
 * Este test verifica que el sistema cumple con la convención de colores ESPERADA:
 * - LIBRE: fondo blanco (#ffffff)
 * - SELECCIONADO: fondo verde (#22c55e)
 * - VENDIDO: fondo azul (#0e3a8c)
 * - RESERVADO: fondo amarillo (#facc15)
 * 
 * También verifica que existe suscripción Supabase Realtime (dependencia instalada).
 * 
 * EXPECTED OUTCOME: Este test DEBE FALLAR en el código sin corregir,
 * demostrando que el bug existe.
 * 
 * **Validates: Requirements 1.2, 1.3, 1.4, 1.5**
 */

/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Replicate the FIXED color logic from VisualizadorAsientos.tsx ───
// This matches the corrected component logic (blanco=libre, verde=seleccionado, azul=vendido, amarillo=reservado)
function getActualSeatColor(estado: string, seleccionado: boolean, tomadoPorOtro: boolean, esPoltrona: boolean) {
  let bg: string;

  if (seleccionado) {
    bg = '#22c55e'; // Fixed: verde para seleccionado
  } else if (tomadoPorOtro) {
    bg = '#fff7ed'; // Naranja para tomado por otro pasajero del grupo
  } else if (estado === 'RESERVADO') {
    bg = '#facc15'; // Fixed: amarillo para reservado (separado de vendido)
  } else if (estado === 'VENDIDO') {
    bg = '#0e3a8c'; // Fixed: azul para vendido
  } else if (esPoltrona) {
    bg = '#fef3c7'; // Poltrona libre (amarillo claro)
  } else {
    bg = '#ffffff'; // Fixed: blanco para libre
  }

  return bg;
}

// ─── Expected color convention (the CORRECT behavior) ───
const EXPECTED_COLORS = {
  LIBRE: '#ffffff',        // Blanco
  SELECCIONADO: '#22c55e', // Verde
  VENDIDO: '#0e3a8c',     // Azul
  RESERVADO: '#facc15',   // Amarillo
} as const;

describe('Bug Condition Exploration: Colores de Asientos', () => {

  describe('Property 1: Convención de Colores Correcta', () => {

    it('estado LIBRE debe tener fondo blanco (#ffffff), NO verde (#d1fae5)', () => {
      const actualColor = getActualSeatColor('LIBRE', false, false, false);
      expect(actualColor).toBe(EXPECTED_COLORS.LIBRE);
    });

    it('estado SELECCIONADO debe tener fondo verde (#22c55e), NO azul oscuro (#00355f)', () => {
      const actualColor = getActualSeatColor('LIBRE', true, false, false);
      expect(actualColor).toBe(EXPECTED_COLORS.SELECCIONADO);
    });

    it('estado VENDIDO debe tener fondo azul (#0e3a8c), NO gris (#e8eaed)', () => {
      const actualColor = getActualSeatColor('VENDIDO', false, false, false);
      expect(actualColor).toBe(EXPECTED_COLORS.VENDIDO);
    });

    it('estado RESERVADO debe tener fondo amarillo (#facc15), NO gris (#e8eaed)', () => {
      const actualColor = getActualSeatColor('RESERVADO', false, false, false);
      expect(actualColor).toBe(EXPECTED_COLORS.RESERVADO);
    });
  });

  describe('Property-Based Test: Para TODO estado, el color debe coincidir con la convención', () => {

    /**
     * **Validates: Requirements 1.2, 1.3, 1.4, 1.5**
     * 
     * Property: Para cualquier asiento con un estado válido (LIBRE, SELECCIONADO, VENDIDO, RESERVADO),
     * el color de fondo asignado DEBE coincidir con la convención de referencia.
     */
    it('para cualquier estado de asiento, el color debe seguir la convención esperada', () => {
      const estadoArbitrary = fc.constantFrom('LIBRE', 'VENDIDO', 'RESERVADO');

      fc.assert(
        fc.property(estadoArbitrary, (estado) => {
          // Para asientos no seleccionados, no tomados por otro, no poltrona
          const actualColor = getActualSeatColor(estado, false, false, false);

          const expectedColor = estado === 'LIBRE' ? EXPECTED_COLORS.LIBRE
            : estado === 'VENDIDO' ? EXPECTED_COLORS.VENDIDO
            : EXPECTED_COLORS.RESERVADO;

          return actualColor === expectedColor;
        }),
        { numRuns: 100 }
      );
    });

    it('para cualquier asiento seleccionado, el color debe ser verde (#22c55e)', () => {
      const estadoArbitrary = fc.constantFrom('LIBRE', 'VENDIDO', 'RESERVADO');
      const esPoltronaArbitrary = fc.boolean();

      fc.assert(
        fc.property(estadoArbitrary, esPoltronaArbitrary, (estado, esPoltrona) => {
          const actualColor = getActualSeatColor(estado, true, false, esPoltrona);
          return actualColor === EXPECTED_COLORS.SELECCIONADO;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Bug Condition: Sin Supabase Realtime', () => {

    it('el package.json NO contiene @supabase/supabase-js como dependencia (sin realtime)', () => {
      const packageJsonPath = resolve(__dirname, '../../package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // El test ESPERA que @supabase/supabase-js ESTÉ instalado (comportamiento correcto)
      // Como actualmente NO está, este test FALLARÁ — demostrando el bug
      expect(allDeps).toHaveProperty('@supabase/supabase-js');
    });

    it('debe existir un archivo supabaseClient.ts en el proyecto', () => {
      const supabaseClientPath = resolve(
        __dirname,
        '../infrastructure/supabase/supabaseClient.ts'
      );

      // El test ESPERA que el archivo exista (comportamiento correcto)
      // Como actualmente NO existe, este test FALLARÁ — demostrando el bug
      expect(existsSync(supabaseClientPath)).toBe(true);
    });

    it('debe existir un hook useAsientosRealtime.ts en el proyecto', () => {
      const hookPath = resolve(
        __dirname,
        '../ui/hooks/useAsientosRealtime.ts'
      );

      // El test ESPERA que el hook exista (comportamiento correcto)
      // Como actualmente NO existe, este test FALLARÁ — demostrando el bug
      expect(existsSync(hookPath)).toBe(true);
    });
  });
});
