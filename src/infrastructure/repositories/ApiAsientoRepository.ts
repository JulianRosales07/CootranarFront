import type { AsientoRepository, ReservarAsientosData } from '../../domain/repositories/AsientoRepository';
import { httpClient } from '../api/httpClient';

export class ApiAsientoRepository implements AsientoRepository {
  async obtenerAsientosViaje(idViaje: number): Promise<any> {
    return httpClient.get(`/asientos/viaje/${idViaje}`);
  }

  async reservarAsientos(data: ReservarAsientosData): Promise<any> {
    // El backend solo tiene endpoint para reservar asientos individuales
    const promesas = data.asientos.map((idAsiento) =>
      httpClient.post(`/asientos/${idAsiento}/reservar`)
    );

    try {
      const resultados = await Promise.all(promesas);
      return {
        data: {
          success: true,
          message: 'Asientos reservados correctamente',
          data: { asientos: resultados.map((r) => r.data) },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async liberarAsientos(_idViaje: number, asientos: number[]): Promise<any> {
    const promesas = asientos.map((idAsiento) =>
      httpClient.post(`/asientos/${idAsiento}/liberar`)
    );

    try {
      await Promise.all(promesas);
      return {
        data: {
          success: true,
          message: 'Asientos liberados correctamente',
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

export const apiAsientoRepository = new ApiAsientoRepository();
