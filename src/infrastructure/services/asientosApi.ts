import { httpClient } from '../api/httpClient';

export interface ReservarAsientosData {
  idviaje: number;
  asientos: number[]; // Array de idAsientoViaje
}

export const asientosApiService = {
  // Obtener asientos de un viaje
  obtenerAsientosViaje: (idViaje: number) => {
    return httpClient.get(`/asientos/viaje/${idViaje}`);
  },

  // Reservar asientos (múltiples)
  reservarAsientos: async (data: ReservarAsientosData) => {
    // El backend solo tiene endpoint para reservar asientos individuales
    // Necesitamos llamar a cada uno por separado
    const promesas = data.asientos.map(idAsiento => 
      httpClient.post(`/asientos/${idAsiento}/reservar`)
    );
    
    try {
      const resultados = await Promise.all(promesas);
      return {
        data: {
          success: true,
          message: 'Asientos reservados correctamente',
          data: { asientos: resultados.map(r => r.data) }
        }
      };
    } catch (error) {
      throw error;
    }
  },

  // Liberar asientos reservados (múltiples)
  liberarAsientos: async (_idViaje: number, asientos: number[]) => {
    const promesas = asientos.map(idAsiento => 
      httpClient.post(`/asientos/${idAsiento}/liberar`)
    );
    
    try {
      await Promise.all(promesas);
      return {
        data: {
          success: true,
          message: 'Asientos liberados correctamente'
        }
      };
    } catch (error) {
      throw error;
    }
  },
};

export default asientosApiService;

