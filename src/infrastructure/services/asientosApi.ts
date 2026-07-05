import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const asientosApi = axios.create({
  baseURL: `${API_URL}/asientos`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante: permite enviar cookies
});

// Interceptor para agregar token (por si acaso se usa token en header)
asientosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null' && token !== 'cookie-based-auth') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface ReservarAsientosData {
  idviaje: number;
  asientos: number[]; // Array de idAsientoViaje
}

export const asientosApiService = {
  // Obtener asientos de un viaje
  obtenerAsientosViaje: (idViaje: number) => {
    return asientosApi.get(`/viaje/${idViaje}`);
  },

  // Reservar asientos (múltiples)
  reservarAsientos: async (data: ReservarAsientosData) => {
    // El backend solo tiene endpoint para reservar asientos individuales
    // Necesitamos llamar a cada uno por separado
    const promesas = data.asientos.map(idAsiento => 
      asientosApi.post(`/${idAsiento}/reservar`)
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
      asientosApi.post(`/${idAsiento}/liberar`)
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
