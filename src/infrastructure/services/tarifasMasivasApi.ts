import { httpClient } from '../api/httpClient';

export const tarifasMasivasApi = {
  obtenerCombinaciones: (idruta: string | number) =>
    httpClient.get(`/tarifas-masivas/combinaciones/${idruta}`),

  guardarTarifasMasivas: (tarifas: any[]) =>
    httpClient.post('/tarifas-masivas/guardar', { tarifas }),

  obtenerCompletitud: (idruta: string | number) =>
    httpClient.get(`/tarifas-masivas/completitud/${idruta}`),
};
