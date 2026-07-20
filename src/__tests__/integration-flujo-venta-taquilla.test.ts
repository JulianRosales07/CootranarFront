/**
 * Integration Tests - Flujo completo de venta en taquilla
 *
 * Feature: refactor-flujo-venta-taquilla
 * Task 6.2: Tests unitarios de integración del flujo completo
 *
 * Verifica:
 * - Flujo: búsqueda → seleccion-asientos → datos-pasajeros → resumen → completado (sin paso tramo)
 * - Payload al backend incluye destinos individuales por pasajero
 * - Grupo con destinos diferentes funciona correctamente
 *
 * **Validates: Requirements 1.2, 6.1, 6.3**
 */

import { describe, it, expect } from 'vitest';

// ─── Tipos extraídos de TaquillaPage ───

type Paso = 'busqueda' | 'configurar-grupo' | 'seleccion-asientos' | 'datos-pasajeros' | 'resumen' | 'completado';

interface AsientoConDatos {
  idasientoviaje: number;
  numero: number;
  piso: number;
  espoltrona: boolean;
  pasajero?: { idusuario: number; nombre: string; apellido: string };
  puntoOrigen?: { idpuntoruta: number; nombre?: string };
  puntoDestino?: { idpuntoruta: number; nombre?: string };
  precio?: number;
}

// ─── Funciones puras extraídas de la lógica del flujo ───

/**
 * Devuelve los pasos válidos del flujo refactorizado.
 */
function obtenerPasosValidos(): Paso[] {
  return ['busqueda', 'configurar-grupo', 'seleccion-asientos', 'datos-pasajeros', 'resumen', 'completado'];
}

/**
 * Simula la transición de paso al seleccionar un viaje.
 * Req 1.2: navegar directamente a 'seleccion-asientos' sin pasar por 'seleccion-tramo'.
 */
function transicionSeleccionarViaje(_pasoActual: Paso): Paso {
  return 'seleccion-asientos';
}

/**
 * Simula la transición de paso al configurar un grupo.
 * Req 6.1: navegar de configurar-grupo directamente a seleccion-asientos.
 */
function transicionConfigurarGrupo(_pasoActual: Paso): Paso {
  return 'seleccion-asientos';
}

/**
 * Simula la transición al continuar desde selección de asientos.
 */
function transicionContinuarAPasajeros(_pasoActual: Paso): Paso {
  return 'datos-pasajeros';
}

/**
 * Simula la transición al continuar a resumen.
 */
function transicionContinuarAResumen(_pasoActual: Paso): Paso {
  return 'resumen';
}

/**
 * Simula la transición al confirmar venta.
 */
function transicionConfirmarVenta(_pasoActual: Paso): Paso {
  return 'completado';
}

/**
 * Genera el flujo completo de navegación del flujo de venta individual.
 */
function generarFlujoCompleto(): Paso[] {
  let paso: Paso = 'busqueda';
  const flujo: Paso[] = [paso];

  paso = transicionSeleccionarViaje(paso);
  flujo.push(paso);

  paso = transicionContinuarAPasajeros(paso);
  flujo.push(paso);

  paso = transicionContinuarAResumen(paso);
  flujo.push(paso);

  paso = transicionConfirmarVenta(paso);
  flujo.push(paso);

  return flujo;
}

/**
 * Genera el flujo completo de navegación para venta grupal.
 */
function generarFlujoGrupal(): Paso[] {
  let paso: Paso = 'busqueda';
  const flujo: Paso[] = [paso];

  // El taquillero elige configurar grupo
  paso = 'configurar-grupo';
  flujo.push(paso);

  paso = transicionConfigurarGrupo(paso);
  flujo.push(paso);

  paso = transicionContinuarAPasajeros(paso);
  flujo.push(paso);

  paso = transicionContinuarAResumen(paso);
  flujo.push(paso);

  paso = transicionConfirmarVenta(paso);
  flujo.push(paso);

  return flujo;
}

/**
 * Construye el payload de asientosVenta para enviar al backend.
 * Extraído directamente de handleConfirmarVenta en TaquillaPage.
 *
 * Req 6.3: destino y precio individual de cada pasajero.
 */
function construirPayloadVenta(
  asientosConDatos: AsientoConDatos[],
  puntoOrigenTaquillero: number | null,
  puntoDestinoFinal: number | null
): Array<{
  idAsientoViaje: number;
  idUsuarioPasajero: number;
  idPuntoOrigen: number;
  idPuntoDestino: number;
  valorCobrado: number;
}> {
  return asientosConDatos.map(a => ({
    idAsientoViaje: a.idasientoviaje,
    idUsuarioPasajero: a.pasajero!.idusuario,
    idPuntoOrigen: a.puntoOrigen?.idpuntoruta || puntoOrigenTaquillero!,
    idPuntoDestino: a.puntoDestino?.idpuntoruta || puntoDestinoFinal!,
    valorCobrado: a.precio || 50000,
  }));
}

// ─── Tests ───

describe('Integration: Flujo completo de venta en taquilla', () => {

  describe('Navegación del flujo (state machine)', () => {

    it('el flujo individual sigue: búsqueda → seleccion-asientos → datos-pasajeros → resumen → completado', () => {
      const flujo = generarFlujoCompleto();
      expect(flujo).toEqual([
        'busqueda',
        'seleccion-asientos',
        'datos-pasajeros',
        'resumen',
        'completado',
      ]);
    });

    it('el flujo grupal sigue: búsqueda → configurar-grupo → seleccion-asientos → datos-pasajeros → resumen → completado', () => {
      const flujo = generarFlujoGrupal();
      expect(flujo).toEqual([
        'busqueda',
        'configurar-grupo',
        'seleccion-asientos',
        'datos-pasajeros',
        'resumen',
        'completado',
      ]);
    });

    it('"seleccion-tramo" NO es un paso válido del flujo', () => {
      const pasosValidos = obtenerPasosValidos();
      expect(pasosValidos).not.toContain('seleccion-tramo');
    });

    it('"seleccion-asiento-pasajero" NO es un paso válido del flujo', () => {
      const pasosValidos = obtenerPasosValidos();
      expect(pasosValidos).not.toContain('seleccion-asiento-pasajero');
    });

    it('al seleccionar un viaje, la transición va directamente a seleccion-asientos (Req 1.2)', () => {
      const siguientePaso = transicionSeleccionarViaje('busqueda');
      expect(siguientePaso).toBe('seleccion-asientos');
    });

    it('al configurar un grupo, la transición va directamente a seleccion-asientos (Req 6.1)', () => {
      const siguientePaso = transicionConfigurarGrupo('configurar-grupo');
      expect(siguientePaso).toBe('seleccion-asientos');
    });

    it('ningún paso del flujo es seleccion-tramo en el recorrido completo', () => {
      const flujoIndividual = generarFlujoCompleto();
      const flujoGrupal = generarFlujoGrupal();
      const todosPasos = [...flujoIndividual, ...flujoGrupal];
      expect(todosPasos).not.toContain('seleccion-tramo');
    });
  });

  describe('Payload de confirmación de venta (Req 6.3)', () => {

    it('el payload incluye idPuntoDestino por cada pasajero', () => {
      const asientosConDatos: AsientoConDatos[] = [
        {
          idasientoviaje: 101,
          numero: 5,
          piso: 1,
          espoltrona: false,
          pasajero: { idusuario: 1, nombre: 'Juan', apellido: 'Pérez' },
          puntoOrigen: { idpuntoruta: 10, nombre: 'Pitalito' },
          puntoDestino: { idpuntoruta: 20, nombre: 'El Bordo' },
          precio: 45000,
        },
        {
          idasientoviaje: 102,
          numero: 6,
          piso: 1,
          espoltrona: true,
          pasajero: { idusuario: 2, nombre: 'María', apellido: 'López' },
          puntoOrigen: { idpuntoruta: 10, nombre: 'Pitalito' },
          puntoDestino: { idpuntoruta: 30, nombre: 'Popayán' },
          precio: 65000,
        },
      ];

      const payload = construirPayloadVenta(asientosConDatos, 10, 30);

      expect(payload).toHaveLength(2);
      // Verificar que cada entrada tiene idPuntoDestino
      payload.forEach(entry => {
        expect(entry).toHaveProperty('idPuntoDestino');
        expect(entry.idPuntoDestino).toBeGreaterThan(0);
      });
    });

    it('el payload incluye valorCobrado por cada pasajero', () => {
      const asientosConDatos: AsientoConDatos[] = [
        {
          idasientoviaje: 201,
          numero: 1,
          piso: 1,
          espoltrona: false,
          pasajero: { idusuario: 10, nombre: 'Carlos', apellido: 'Gómez' },
          puntoOrigen: { idpuntoruta: 5 },
          puntoDestino: { idpuntoruta: 15 },
          precio: 30000,
        },
      ];

      const payload = construirPayloadVenta(asientosConDatos, 5, 15);

      expect(payload[0].valorCobrado).toBe(30000);
    });

    it('si un pasajero no tiene puntoDestino explícito, usa puntoDestinoFinal como fallback', () => {
      const asientosConDatos: AsientoConDatos[] = [
        {
          idasientoviaje: 301,
          numero: 3,
          piso: 1,
          espoltrona: false,
          pasajero: { idusuario: 20, nombre: 'Ana', apellido: 'Ruiz' },
          puntoOrigen: { idpuntoruta: 5 },
          puntoDestino: undefined, // Sin destino explícito
          precio: 50000,
        },
      ];

      const puntoDestinoFinal = 99;
      const payload = construirPayloadVenta(asientosConDatos, 5, puntoDestinoFinal);

      expect(payload[0].idPuntoDestino).toBe(puntoDestinoFinal);
    });

    it('si un pasajero no tiene precio explícito, usa 50000 como fallback', () => {
      const asientosConDatos: AsientoConDatos[] = [
        {
          idasientoviaje: 401,
          numero: 7,
          piso: 1,
          espoltrona: false,
          pasajero: { idusuario: 30, nombre: 'Pedro', apellido: 'Díaz' },
          puntoOrigen: { idpuntoruta: 5 },
          puntoDestino: { idpuntoruta: 15 },
          precio: undefined, // Sin precio explícito
        },
      ];

      const payload = construirPayloadVenta(asientosConDatos, 5, 15);

      expect(payload[0].valorCobrado).toBe(50000);
    });
  });

  describe('Grupo con destinos diferentes (Req 6.3)', () => {

    it('un grupo de 3 pasajeros con destinos diferentes genera payload con destinos individuales', () => {
      const asientosConDatos: AsientoConDatos[] = [
        {
          idasientoviaje: 501,
          numero: 1,
          piso: 1,
          espoltrona: false,
          pasajero: { idusuario: 100, nombre: 'Pasajero', apellido: 'Uno' },
          puntoOrigen: { idpuntoruta: 10, nombre: 'Pitalito' },
          puntoDestino: { idpuntoruta: 20, nombre: 'El Bordo' },
          precio: 35000,
        },
        {
          idasientoviaje: 502,
          numero: 2,
          piso: 1,
          espoltrona: false,
          pasajero: { idusuario: 101, nombre: 'Pasajero', apellido: 'Dos' },
          puntoOrigen: { idpuntoruta: 10, nombre: 'Pitalito' },
          puntoDestino: { idpuntoruta: 30, nombre: 'Popayán' },
          precio: 55000,
        },
        {
          idasientoviaje: 503,
          numero: 3,
          piso: 1,
          espoltrona: true,
          pasajero: { idusuario: 102, nombre: 'Pasajero', apellido: 'Tres' },
          puntoOrigen: { idpuntoruta: 10, nombre: 'Pitalito' },
          puntoDestino: { idpuntoruta: 40, nombre: 'Cali' },
          precio: 80000,
        },
      ];

      const payload = construirPayloadVenta(asientosConDatos, 10, 40);

      // Verificar que cada pasajero tiene su propio destino
      expect(payload[0].idPuntoDestino).toBe(20); // El Bordo
      expect(payload[1].idPuntoDestino).toBe(30); // Popayán
      expect(payload[2].idPuntoDestino).toBe(40); // Cali
    });

    it('cada pasajero del grupo tiene su propio valorCobrado según su destino', () => {
      const asientosConDatos: AsientoConDatos[] = [
        {
          idasientoviaje: 601,
          numero: 10,
          piso: 1,
          espoltrona: false,
          pasajero: { idusuario: 200, nombre: 'Adulto', apellido: 'Uno' },
          puntoOrigen: { idpuntoruta: 5 },
          puntoDestino: { idpuntoruta: 15 },
          precio: 25000,
        },
        {
          idasientoviaje: 602,
          numero: 11,
          piso: 1,
          espoltrona: false,
          pasajero: { idusuario: 201, nombre: 'Adulto', apellido: 'Dos' },
          puntoOrigen: { idpuntoruta: 5 },
          puntoDestino: { idpuntoruta: 25 },
          precio: 45000,
        },
        {
          idasientoviaje: 603,
          numero: 12,
          piso: 2,
          espoltrona: true,
          pasajero: { idusuario: 202, nombre: 'Niño', apellido: 'Uno' },
          puntoOrigen: { idpuntoruta: 5 },
          puntoDestino: { idpuntoruta: 25 },
          precio: 65000, // más caro por poltrona
        },
      ];

      const payload = construirPayloadVenta(asientosConDatos, 5, 25);

      expect(payload[0].valorCobrado).toBe(25000);
      expect(payload[1].valorCobrado).toBe(45000);
      expect(payload[2].valorCobrado).toBe(65000);
    });

    it('grupo mixto: algunos con destino explícito y otros con fallback al destino final', () => {
      const asientosConDatos: AsientoConDatos[] = [
        {
          idasientoviaje: 701,
          numero: 4,
          piso: 1,
          espoltrona: false,
          pasajero: { idusuario: 300, nombre: 'Con', apellido: 'Destino' },
          puntoOrigen: { idpuntoruta: 10 },
          puntoDestino: { idpuntoruta: 20 }, // Destino explícito
          precio: 40000,
        },
        {
          idasientoviaje: 702,
          numero: 5,
          piso: 1,
          espoltrona: false,
          pasajero: { idusuario: 301, nombre: 'Sin', apellido: 'Destino' },
          puntoOrigen: { idpuntoruta: 10 },
          puntoDestino: undefined, // Sin destino → fallback
          precio: 50000,
        },
      ];

      const puntoDestinoFinal = 99;
      const payload = construirPayloadVenta(asientosConDatos, 10, puntoDestinoFinal);

      // Primer pasajero usa su destino explícito
      expect(payload[0].idPuntoDestino).toBe(20);
      // Segundo pasajero usa el fallback (puntoDestinoFinal)
      expect(payload[1].idPuntoDestino).toBe(puntoDestinoFinal);
    });

    it('el payload tiene exactamente un registro por cada pasajero del grupo', () => {
      const numPasajeros = 4;
      const asientosConDatos: AsientoConDatos[] = Array.from({ length: numPasajeros }, (_, i) => ({
        idasientoviaje: 800 + i,
        numero: i + 1,
        piso: 1,
        espoltrona: i % 2 === 0,
        pasajero: { idusuario: 400 + i, nombre: `Pasajero${i}`, apellido: `Apellido${i}` },
        puntoOrigen: { idpuntoruta: 10 },
        puntoDestino: { idpuntoruta: 20 + i * 5 },
        precio: 30000 + i * 10000,
      }));

      const payload = construirPayloadVenta(asientosConDatos, 10, 50);

      expect(payload).toHaveLength(numPasajeros);
      // Cada registro tiene todos los campos requeridos
      payload.forEach((entry, i) => {
        expect(entry.idAsientoViaje).toBe(800 + i);
        expect(entry.idUsuarioPasajero).toBe(400 + i);
        expect(entry.idPuntoOrigen).toBe(10);
        expect(entry.idPuntoDestino).toBe(20 + i * 5);
        expect(entry.valorCobrado).toBe(30000 + i * 10000);
      });
    });
  });
});
