import { httpClient } from '../api/httpClient';

export const reportesApi = {
  resumenDashboard: (params: Record<string, unknown> = {}) =>
    httpClient.get('/reportes/dashboard', { params }),

  ingresosPorVehiculo: (params: Record<string, unknown> = {}) =>
    httpClient.get('/reportes/ingresos-por-vehiculo', { params }),

  detalleTiquetesPorVehiculo: (idVehiculo: string, params: Record<string, unknown> = {}) =>
    httpClient.get(`/reportes/ingresos-por-vehiculo/${idVehiculo}/tiquetes`, { params }),
};
