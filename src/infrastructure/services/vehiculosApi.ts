import { httpClient } from '../api/httpClient';

export const vehiculosApi = {
  // ==================== VEHÍCULOS ====================
  
  obtenerTodos: (params = {}) =>
    httpClient.get('/vehiculos', { params }),

  obtenerActivos: (params = {}) =>
    httpClient.get('/vehiculos/activos', { params }),

  obtenerInactivos: (params = {}) =>
    httpClient.get('/vehiculos/inactivos', { params }),

  buscar: (busqueda: string, params = {}) =>
    httpClient.get('/vehiculos/buscar', { params: { busqueda, ...params } }),

  obtenerPorId: (idvehiculo: string) =>
    httpClient.get(`/vehiculos/${idvehiculo}`),

  crear: (formData: FormData) =>
    httpClient.post('/vehiculos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  actualizar: (idvehiculo: string, data: any) =>
    httpClient.put(`/vehiculos/${idvehiculo}`, data),

  activar: (idvehiculo: string) =>
    httpClient.patch(`/vehiculos/${idvehiculo}/activar`, {}),

  desactivar: (idvehiculo: string) =>
    httpClient.patch(`/vehiculos/${idvehiculo}/desactivar`, {}),

  // ==================== DOCUMENTOS ====================
  
  obtenerDocumentos: (idvehiculo: string) =>
    httpClient.get(`/vehiculos/${idvehiculo}/documentos`),

  actualizarDocumento: (iddocumento: string, data: FormData | any) => {
    const isFormData = data instanceof FormData;
    return httpClient.put(`/vehiculos/documentos/${iddocumento}`, data, 
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    );
  },

  // ==================== PÓLIZAS ====================
  
  obtenerPolizas: (idvehiculo: string) =>
    httpClient.get(`/vehiculos/${idvehiculo}/polizas`),

  actualizarPoliza: (idpoliza: string, data: FormData | any) => {
    const isFormData = data instanceof FormData;
    return httpClient.put(`/vehiculos/polizas/${idpoliza}`, data,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    );
  },

  // ==================== CONDUCTORES ====================
  
  obtenerConductores: (idvehiculo: string) =>
    httpClient.get(`/vehiculos/${idvehiculo}/conductores`),

  asignarConductor: (idvehiculo: string, idusuario: number, esRemplazo: boolean = false) =>
    httpClient.post(`/vehiculos/${idvehiculo}/conductores`, { idusuario, esRemplazo }),

  desasignarConductor: (idvehiculo: string, idusuario: number) =>
    httpClient.delete(`/vehiculos/${idvehiculo}/conductores/${idusuario}`),
};

export const propietariosApi = {
  obtenerTodos: (params = {}) =>
    httpClient.get('/usuarios/propietarios', { params }),

  obtenerActivos: (params = {}) =>
    httpClient.get('/usuarios/propietarios/activos', { params }),

  buscar: (busqueda: string, params = {}) =>
    httpClient.get('/usuarios/propietarios/buscar', { params: { busqueda, ...params } }),

  obtenerPorId: (idusuario: number) =>
    httpClient.get(`/usuarios/propietarios/${idusuario}`),

  obtenerPorDocumento: (documento: string) =>
    httpClient.get(`/usuarios/propietarios/documento/${documento}`),

  crear: (data: any) =>
    httpClient.post('/usuarios/propietarios', data),
};

export const tiposBusApi = {
  obtenerActivos: () => httpClient.get('/tipoBus/activos'),
};

export const tiposServicioApi = {
  obtenerActivos: () => httpClient.get('/tipoServicio/activos'),
};

export const aseguradorasApi = {
  obtenerActivas: () => httpClient.get('/aseguradoras/activas'),
};

export const archivosApi = {
  obtenerUrlFirmada: (url: string) =>
    httpClient.get('/archivos/url-firmada', { params: { url } }),
};
