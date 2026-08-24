import { httpClient } from '../api/httpClient';

export interface PerfilUsuario {
  idusuario: number;
  nombre: string;
  apellido?: string;
  correo: string;
  documento?: string;
  tipodocumento?: string;
  telefono?: string;
  idrol?: number;
  nombrerol?: string;
  fotoperfil?: string | null;
  estadousuario?: string;
  nombreoficina?: string;
  nombreagencia?: string;
  direccion?: string;
}

export const perfilApi = {
  obtenerPerfil: async () => {
    try {
      const res = await httpClient.get('/usuarios/perfil');
      return res.data?.data || res.data;
    } catch (error) {
      console.warn('Error al consultar /usuarios/perfil, usando datos locales:', error);
      return null;
    }
  },

  actualizarFotoPerfil: async (formData: FormData) => {
    return httpClient.put('/usuarios/foto-perfil', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
